const { FoodTruck, User, Location } = require('../models');

const createFoodTruck = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const userId = req.user?.id || req.userId;

    const newTruck = await FoodTruck.create({ name, description, logo, UserId: userId });
    res.status(201).json({ error: false, message: 'Food Truck creado', data: newTruck });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al crear', details: error.message });
  }
};

const getAllFoodTrucks = async (req, res) => {
  try {
    
    const trucks = await FoodTruck.findAll({
      include: [{ model: Location, as: 'locations' }] 
    });
    res.status(200).json({ error: false, data: trucks });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener el catálogo' });
  }
};


const getMyFoodTrucks = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const currentUser = await User.findByPk(userId); 
    
    let myTrucks;
    
    
    if (currentUser && currentUser.isAdmin) {
      myTrucks = await FoodTruck.findAll();
    } else {
      
      myTrucks = await FoodTruck.findAll({ where: { UserId: userId } });
    }
    
    res.status(200).json({ error: false, data: myTrucks });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al cargar el panel' });
  }
};

const updateFoodTruck = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, description, logo } = req.body;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(id);
    const currentUser = await User.findByPk(userId);

    if (!truck) return res.status(404).json({ error: true, message: 'No encontrado' });

   
    if (truck.UserId !== userId && !currentUser.isAdmin) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    await truck.update({ name, description, logo });
    res.status(200).json({ error: false, message: 'Actualizado con éxito', data: truck });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar', details: error.message });
  }
};

const deleteFoodTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(id);
    const currentUser = await User.findByPk(userId);

    if (!truck) return res.status(404).json({ error: true, message: 'No encontrado' });

    
    if (truck.UserId !== userId && !currentUser.isAdmin) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    await truck.destroy();
    res.status(200).json({ error: false, message: 'Eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar', details: error.message });
  }
};

module.exports = {
  createFoodTruck,
  getAllFoodTrucks,
  getMyFoodTrucks,
  updateFoodTruck,  
  deleteFoodTruck    
};