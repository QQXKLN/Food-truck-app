const { FoodTruck } = require('../models');


const createFoodTruck = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    
    
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

const updateFoodTruck = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, description, logo } = req.body;

    const truck = await FoodTruck.findByPk(id);
    if (!truck) {
      return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });
    }

   
    await truck.update({ name, description, logo });

    res.status(200).json({
      error: false,
      message: 'Food Truck actualizado con éxito',
      data: truck
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar', details: error.message });
  }
};


const deleteFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;

    const truck = await FoodTruck.findByPk(id);
    if (!truck) {
      return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });
    }

    
    await truck.destroy();

    res.status(200).json({
      error: false,
      message: 'Food Truck eliminado con éxito'
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar', details: error.message });
  }
};

module.exports = {
  createFoodTruck,
  getAllFoodTrucks,
  updateFoodTruck,  
  deleteFoodTruck    
};