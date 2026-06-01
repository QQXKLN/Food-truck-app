const { FoodTruck } = require('../models');

// Función para crear un nuevo Food Truck
const createFoodTruck = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    
    // Le decimos a Sequelize que cree un nuevo registro
    const newTruck = await FoodTruck.create({ name, description, logo });
    
    res.status(201).json({
      error: false,
      message: 'Food Truck creado con éxito',
      data: newTruck
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Hubo un error al crear el Food Truck',
      details: error.message
    });
  }
};

// Función para obtener todos los Food Trucks
const getAllFoodTrucks = async (req, res) => {
  try {
    const trucks = await FoodTruck.findAll();
    res.status(200).json({
      error: false,
      data: trucks
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error al obtener los Food Trucks'
    });
  }
};

module.exports = {
  createFoodTruck,
  getAllFoodTrucks
};