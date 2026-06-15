const { Location, FoodTruck } = require('../models');

const addLocation = async (req, res) => {
  try {
    const { address, schedule, FoodTruckId } = req.body; // El frontend lo manda con mayúscula
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(FoodTruckId);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });
    if (truck.UserId !== userId) return res.status(403).json({ error: true, message: 'Acceso denegado' });

    
    const newLocation = await Location.create({ address, schedule, foodTruckId: FoodTruckId });
    res.status(201).json({ error: false, message: 'Ubicación añadida', data: newLocation });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al añadir ubicación', details: error.message });
  }
};

const getTruckLocations = async (req, res) => {
  try {
    const { truckId } = req.params;
    
    const locations = await Location.findAll({ where: { foodTruckId: truckId } });
    res.status(200).json({ error: false, data: locations });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener ubicaciones' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, schedule } = req.body;
    const userId = req.user?.id || req.userId;

    const location = await Location.findByPk(id, { include: { model: FoodTruck } });
    if (!location) return res.status(404).json({ error: true, message: 'Ubicación no encontrada' });

    if (location.FoodTruck.UserId !== userId) {
      return res.status(403).json({ error: true, message: 'No tienes permiso para editar esta ubicación' });
    }

    await location.update({ address, schedule });
    res.status(200).json({ error: false, message: 'Ubicación actualizada', data: location });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar ubicación' });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const location = await Location.findByPk(id, { include: { model: FoodTruck } });
    if (!location) return res.status(404).json({ error: true, message: 'Ubicación no encontrada' });

    if (location.FoodTruck.UserId !== userId) return res.status(403).json({ error: true, message: 'Acceso denegado' });

    await location.destroy();
    res.status(200).json({ error: false, message: 'Ubicación eliminada' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar ubicación' });
  }
};

module.exports = { addLocation, getTruckLocations, updateLocation, deleteLocation };