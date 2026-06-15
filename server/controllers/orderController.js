const { Order, FoodTruck, Dish, OrderItem, User, sequelize } = require('../models');

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
};

const normalizeOrderItems = async (items, foodTruckId) => {
  const quantitiesByDish = new Map();

  items.forEach((item) => {
    const dishId = Number(item.id);
    const quantity = Number(item.quantity || 1);
    quantitiesByDish.set(dishId, (quantitiesByDish.get(dishId) || 0) + quantity);
  });

  const dishIds = [...quantitiesByDish.keys()];
  const dishes = await Dish.findAll({ where: { id: dishIds, foodTruckId } });

  if (dishes.length !== dishIds.length) {
    const error = new Error('Uno o mas platos no pertenecen al Food Truck seleccionado');
    error.status = 400;
    throw error;
  }

  const unavailableDish = dishes.find((dish) => dish.isAvailable === false);
  if (unavailableDish) {
    const error = new Error(`El plato ${unavailableDish.name} no esta disponible`);
    error.status = 400;
    throw error;
  }

  return dishes.map((dish) => {
    const quantity = quantitiesByDish.get(dish.id);
    const price = Number(dish.price);

    return {
      dishId: dish.id,
      name: dish.name,
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

    const orderItems = await normalizeOrderItems(items, foodTruckId);
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newOrder = await sequelize.transaction(async (transaction) => {
      const order = await Order.create({
        foodTruckId,
        userId: req.user.id,
        total,
        paymentMethod,
        status: 'Pendiente',
        items: JSON.stringify(orderItems)
      }, { transaction });

      await OrderItem.bulkCreate(orderItems.map((item) => ({
        orderId: order.id,
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price
      })), { transaction });

      return order;
    });

    res.status(200).json({
      error: false,
      message: 'Pedido recibido',
      orderId: newOrder.id,
      total
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
      include: [FoodTruck],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ error: false, data: orders });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno' });
  }
};

module.exports = {
  placeOrder,
  getTruckOrders,
  updateOrderStatus,
  getMyPurchases
};
