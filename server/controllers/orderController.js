const { Order, FoodTruck, Dish, OrderItem, User, DailyMenuItem, sequelize, Sequelize } = require('../models');
const { getTodayDate, findActiveLocation } = require('../services/truckAvailabilityService');

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
};

const normalizeOrderItems = async (items, foodTruckId, transaction) => {
  const quantitiesByDish = new Map();
  const today = getTodayDate();

  items.forEach((item) => {
    const dishId = Number(item.id);
    const quantity = Number(item.quantity || 1);
    quantitiesByDish.set(dishId, (quantitiesByDish.get(dishId) || 0) + quantity);
  });

  const dishIds = [...quantitiesByDish.keys()];
  const dailyItems = await DailyMenuItem.findAll({
    where: { foodTruckId, date: today, dishId: dishIds },
    include: [{ model: Dish, as: 'dish' }],
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (dailyItems.length !== dishIds.length) {
    const error = new Error('Uno o mas platos no estan publicados en el menu de hoy');
    error.status = 400;
    throw error;
  }

  return dailyItems.map((dailyItem) => {
    const quantity = quantitiesByDish.get(dailyItem.dishId);

    if (!dailyItem.isAvailable || dailyItem.dish?.isAvailable === false) {
      const error = new Error(`El plato ${dailyItem.dish?.name || dailyItem.dishId} no esta disponible hoy`);
      error.status = 400;
      throw error;
    }

    if (dailyItem.stock < quantity) {
      const error = new Error(`Stock insuficiente para ${dailyItem.dish.name}. Quedan ${dailyItem.stock}.`);
      error.status = 400;
      throw error;
    }

    const price = Number(dailyItem.dish.price);

    return {
      dailyItem,
      dishId: dailyItem.dishId,
      name: dailyItem.dish.name,
      price,
      quantity,
      subtotal: price * quantity
    };
  });
};

const placeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, paymentMethod } = req.body;
    const foodTruckId = Number(id);

    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    const activeLocation = await findActiveLocation(foodTruckId);
    if (!activeLocation) {
      return res.status(400).json({
        error: true,
        message: 'Este Food Truck no tiene una ubicacion activa para este dia y horario'
      });
    }

    const newOrder = await sequelize.transaction(async (transaction) => {
      const orderItems = await normalizeOrderItems(items, foodTruckId, transaction);
      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      orderItems.forEach((item) => {
        item.dailyItem.stock -= item.quantity;
      });

      await Promise.all(orderItems.map((item) => item.dailyItem.save({ transaction })));

      const order = await Order.create({
        foodTruckId,
        userId: req.user.id,
        total,
        paymentMethod,
        status: 'Pendiente',
        items: JSON.stringify(orderItems.map(({ dailyItem, ...item }) => item))
      }, { transaction });

      await OrderItem.bulkCreate(orderItems.map((item) => ({
        orderId: order.id,
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price
      })), { transaction });

      return { order, total };
    });

    res.status(200).json({
      error: false,
      message: 'Pedido recibido',
      orderId: newOrder.order.id,
      total: newOrder.total
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: true, message: error.message || 'Error al procesar el pedido' });
  }
};

const getTruckOrders = async (req, res) => {
  try {
    const truck = await FoodTruck.findByPk(req.params.id);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    if (!(await canManageTruck(truck, req.user.id))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    const orders = await Order.findAll({
      where: { foodTruckId: req.params.id },
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [Dish]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ error: false, data: orders });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, { include: [FoodTruck] });
    if (!order) return res.status(404).json({ error: true, message: 'Pedido no encontrado' });

    if (!(await canManageTruck(order.FoodTruck, req.user.id))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    order.status = req.body.status;
    await order.save();

    res.status(200).json({ error: false, message: 'Pedido actualizado', data: order });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno' });
  }
};

const getMyPurchases = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        FoodTruck,
        {
          model: OrderItem,
          as: 'orderItems',
          include: [Dish]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ error: false, data: orders });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno' });
  }
};

const getSalesRanking = async (req, res) => {
  try {
    const ranking = await Order.findAll({
      attributes: [
        'foodTruckId',
        [Sequelize.fn('COUNT', Sequelize.col('Order.id')), 'ordersCount'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('total')), 0), 'totalSales']
      ],
      where: { status: 'Entregado' },
      include: [{
        model: FoodTruck,
        attributes: ['id', 'name', 'logo']
      }],
      group: ['Order.foodTruckId', 'FoodTruck.id'],
      order: [[Sequelize.literal('"totalSales"'), 'DESC']],
      limit: 10
    });

    res.status(200).json({ error: false, data: ranking });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener ranking de ventas' });
  }
};

module.exports = {
  placeOrder,
  getTruckOrders,
  updateOrderStatus,
  getMyPurchases,
  getSalesRanking
};
