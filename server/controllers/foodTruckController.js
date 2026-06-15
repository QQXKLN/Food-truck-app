const { FoodTruck, User, Location, Dish, DailyMenuItem } = require('../models');
const orderController = require('./orderController');
const { getTodayDate, findActiveLocation } = require('../services/truckAvailabilityService');

const getTruckIncludeDetails = (date = getTodayDate()) => [
  { model: Location, as: 'locations' },
  { model: Dish, as: 'dishes' },
  {
    model: DailyMenuItem,
    as: 'dailyMenuItems',
    required: false,
    where: { date },
    include: [{ model: Dish, as: 'dish' }]
  }
];

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
};

const decorateTruck = async (truck) => {
  const plainTruck = truck.toJSON();
  plainTruck.activeLocation = await findActiveLocation(truck.id);
  plainTruck.todayMenu = plainTruck.dailyMenuItems || [];
  return plainTruck;
};

const createFoodTruck = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const userId = req.user?.id || req.userId;

    const newTruck = await FoodTruck.create({ name, description, logo, UserId: userId });
    res.status(201).json({ error: false, message: 'Food Truck creado', data: newTruck });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al crear Food Truck', details: error.message });
  }
};

const getAllFoodTrucks = async (req, res) => {
  try {
    const trucks = await FoodTruck.findAll({ include: getTruckIncludeDetails() });
    const data = await Promise.all(trucks.map(decorateTruck));

    res.status(200).json({ error: false, data });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener el catalogo' });
  }
};

const getMyFoodTrucks = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const currentUser = await User.findByPk(userId);

    const trucks = currentUser?.isAdmin
      ? await FoodTruck.findAll({ include: getTruckIncludeDetails() })
      : await FoodTruck.findAll({ where: { UserId: userId }, include: getTruckIncludeDetails() });

    const data = await Promise.all(trucks.map(decorateTruck));
    res.status(200).json({ error: false, data });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al cargar el panel' });
  }
};

const updateFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(id);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    if (!(await canManageTruck(truck, userId))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    const allowedFields = ['name', 'description', 'logo'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await truck.update(updates);
    res.status(200).json({ error: false, message: 'Food Truck actualizado', data: truck });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar Food Truck', details: error.message });
  }
};

const deleteFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(id);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    if (!(await canManageTruck(truck, userId))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    await truck.destroy();
    res.status(200).json({ error: false, message: 'Food Truck eliminado' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar Food Truck', details: error.message });
  }
};

const getFoodTruckById = async (req, res) => {
  try {
    const { id } = req.params;

    const truck = await FoodTruck.findByPk(id, { include: getTruckIncludeDetails() });
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    res.status(200).json({ error: false, data: await decorateTruck(truck) });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
};

const getDailyMenu = async (req, res) => {
  try {
    const foodTruckId = Number(req.params.id);
    const date = req.query.date || getTodayDate();

    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    const items = await DailyMenuItem.findAll({
      where: { foodTruckId, date },
      include: [{ model: Dish, as: 'dish' }],
      order: [[{ model: Dish, as: 'dish' }, 'name', 'ASC']]
    });

    res.status(200).json({ error: false, data: items });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener menu diario' });
  }
};

const upsertDailyMenuItem = async (req, res) => {
  try {
    const foodTruckId = Number(req.params.id);
    const userId = req.user?.id || req.userId;
    const { dishId, stock, isAvailable = true } = req.body;
    const date = req.body.date || getTodayDate();

    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    if (!(await canManageTruck(truck, userId))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    const dish = await Dish.findOne({ where: { id: dishId, foodTruckId } });
    if (!dish) return res.status(404).json({ error: true, message: 'Plato no encontrado para este Food Truck' });

    const [menuItem] = await DailyMenuItem.findOrCreate({
      where: { foodTruckId, dishId, date },
      defaults: { stock, isAvailable }
    });

    await menuItem.update({ stock, isAvailable });
    const savedItem = await DailyMenuItem.findByPk(menuItem.id, { include: [{ model: Dish, as: 'dish' }] });

    res.status(200).json({ error: false, message: 'Menu diario actualizado', data: savedItem });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar menu diario', details: error.message });
  }
};

const placeOrder = (req, res) => {
  return orderController.placeOrder(req, res);
};

module.exports = {
  getAllFoodTrucks,
  getMyFoodTrucks,
  createFoodTruck,
  updateFoodTruck,
  deleteFoodTruck,
  getFoodTruckById,
  getDailyMenu,
  upsertDailyMenuItem,
  placeOrder
};
