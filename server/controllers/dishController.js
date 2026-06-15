const { Dish, FoodTruck } = require('../models');

// Crear un nuevo plato
const createDish = async (req, res) => {
  try {
    const { name, description, price, stock, foodTruckId } = req.body;
    const userId = req.user?.id || req.userId;

    
    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!truck || truck.UserId !== userId) {
      return res.status(403).json({ error: true, message: 'No tienes permiso sobre este Food Truck' });
    }

    
    if (stock < 0) return res.status(400).json({ error: true, message: 'El stock no puede ser negativo' });

    const newDish = await Dish.create({ name, description, price, stock, foodTruckId });
    res.status(201).json({ error: false, message: 'Plato creado con éxito', data: newDish });
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
    const { name, description, price, stock } = req.body;
    const userId = req.user?.id || req.userId;

    const dish = await Dish.findByPk(id, { include: { model: FoodTruck } });
    if (!dish) return res.status(404).json({ error: true, message: 'Plato no encontrado' });

    if (dish.FoodTruck.UserId !== userId) {
      return res.status(403).json({ error: true, message: 'No tienes permiso' });
    }

    if (stock !== undefined && stock < 0) return res.status(400).json({ error: true, message: 'Stock inválido' });

    await dish.update({ name, description, price, stock });
    res.status(200).json({ error: false, message: 'Plato actualizado', data: dish });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar' });
  }
};

const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const dish = await Dish.findByPk(id, { include: { model: FoodTruck } });
    if (!dish) return res.status(404).json({ error: true, message: 'Plato no encontrado' });

    if (dish.FoodTruck.UserId !== userId) return res.status(403).json({ error: true, message: 'No tienes permiso' });

    await dish.destroy();
    res.status(200).json({ error: false, message: 'Plato eliminado' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar' });
  }
};

module.exports = { createDish, getDishes, updateDish, deleteDish };