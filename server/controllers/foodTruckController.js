const { FoodTruck, User, Location, Dish } = require('../models');
const orderController = require('./orderController');

const includeTruckDetails = [
  { model: Location, as: 'locations' },
  { model: Dish, as: 'dishes' }
];

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
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
    const trucks = await FoodTruck.findAll({ include: includeTruckDetails });
    res.status(200).json({ error: false, data: trucks });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener el catalogo' });
  }
};

const getMyFoodTrucks = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const currentUser = await User.findByPk(userId);

    const myTrucks = currentUser?.isAdmin
      ? await FoodTruck.findAll({ include: includeTruckDetails })
      : await FoodTruck.findAll({ where: { UserId: userId }, include: includeTruckDetails });

    res.status(200).json({ error: false, data: myTrucks });
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

    const truck = await FoodTruck.findByPk(id, { include: includeTruckDetails });
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    res.status(200).json({ error: false, data: truck });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
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
  placeOrder
};
