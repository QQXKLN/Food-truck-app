const { Dish, FoodTruck, User } = require('../models');

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
};

const createDish = async (req, res) => {
  try {
    const { name, description, price, foodTruckId, isAvailable = true } = req.body;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!(await canManageTruck(truck, userId))) {
      return res.status(403).json({ error: true, message: 'No tienes permiso sobre este Food Truck' });
    }

    const newDish = await Dish.create({ name, description, price, isAvailable, foodTruckId });
    res.status(201).json({ error: false, message: 'Plato creado con exito', data: newDish });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al crear plato', details: error.message });
  }
};

const getDishes = async (req, res) => {
  try {
    const { truckId } = req.params;
    const dishes = await Dish.findAll({ where: { foodTruckId: truckId } });
    res.status(200).json({ error: false, data: dishes });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener platos' });
  }
};

const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const dish = await Dish.findByPk(id, { include: { model: FoodTruck } });
    if (!dish) return res.status(404).json({ error: true, message: 'Plato no encontrado' });

    if (!(await canManageTruck(dish.FoodTruck, userId))) {
      return res.status(403).json({ error: true, message: 'No tienes permiso' });
    }

    const allowedFields = ['name', 'description', 'price', 'isAvailable'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await dish.update(updates);
    res.status(200).json({ error: false, message: 'Plato actualizado', data: dish });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar plato', details: error.message });
  }
};

const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const dish = await Dish.findByPk(id, { include: { model: FoodTruck } });
    if (!dish) return res.status(404).json({ error: true, message: 'Plato no encontrado' });

    if (!(await canManageTruck(dish.FoodTruck, userId))) {
      return res.status(403).json({ error: true, message: 'No tienes permiso' });
    }

    await dish.destroy();
    res.status(200).json({ error: false, message: 'Plato eliminado' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar plato', details: error.message });
  }
};

module.exports = { createDish, getDishes, updateDish, deleteDish };
