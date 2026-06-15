const { FoodTruck, User, Location, Dish } = require('../models');

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
      include: [
        { model: Location, as: 'locations' },
        { model: Dish, as: 'dishes' } 
      ] 
    });
    res.status(200).json({ error: false, data: trucks });
  } catch (error) {
   
    console.log("❌ ERROR REAL EN EL BACKEND:", error); 
    
    res.status(500).json({ error: true, message: 'Error al obtener el catálogo' });
  }
};


const getMyFoodTrucks = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const currentUser = await User.findByPk(userId);
    let myTrucks;

    
    const includeConfig = [
      { model: Location, as: 'locations' },
      { model: Dish, as: 'dishes' } 
    ];

    if (currentUser && currentUser.isAdmin) {
      
      myTrucks = await FoodTruck.findAll({ include: includeConfig });
    } else {
      
      myTrucks = await FoodTruck.findAll({ 
        where: { UserId: userId },
        include: includeConfig
      });
    }

    res.status(200).json({ error: false, data: myTrucks });
  } catch (error) {
    console.error("Error en getMyFoodTrucks:", error);
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
const getFoodTruckById = async (req, res) => {
  try {
    const { id } = req.params;
    
   
    const truck = await FoodTruck.findByPk(id, {
      include: [
        { model: Location, as: 'locations' },
        { model: Dish, as: 'dishes' }
      ]
    });

    if (!truck) {
      return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });
    }

    res.status(200).json({ error: false, data: truck });
  } catch (error) {
    console.error("Error al obtener Food Truck:", error);
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
};
const placeOrder = async (req, res) => {
  try {
    const { id } = req.params; 
    const { items, paymentMethod } = req.body;

    
    if (!paymentMethod) {
      return res.status(400).json({ error: true, message: 'Método de pago requerido' });
    }

    
    const quantities = {};
    items.forEach(item => {
      quantities[item.id] = (quantities[item.id] || 0) + 1;
    });

    
    for (const dishId in quantities) {
      const dish = await Dish.findByPk(dishId);
      const quantityToBuy = quantities[dishId];

      if (!dish) {
         return res.status(404).json({ error: true, message: `Plato no encontrado` });
      }
      
      if (dish.stock < quantityToBuy) {
        return res.status(400).json({ error: true, message: `Stock insuficiente para: ${dish.name}. Solo quedan ${dish.stock}.` });
      }

      
      dish.stock -= quantityToBuy;
      await dish.save();
    }

    
    res.status(200).json({ error: false, message: 'Pedido procesado y stock actualizado con éxito' });
  } catch (error) {
    console.error("Error al procesar pedido:", error);
    res.status(500).json({ error: true, message: 'Error interno del servidor al procesar el pago' });
  }
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