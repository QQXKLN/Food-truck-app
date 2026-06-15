const { Location, FoodTruck, User } = require('../models');

const canManageTruck = async (truck, userId) => {
  if (!truck || !userId) return false;
  if (truck.UserId === userId) return true;

  const currentUser = await User.findByPk(userId);
  return Boolean(currentUser?.isAdmin);
};

const buildSchedule = ({ startTime, endTime, schedule }) => {
  if (schedule) return schedule;
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return 'Horario por confirmar';
};

const addLocation = async (req, res) => {
  try {
    const foodTruckId = req.body.foodTruckId || req.body.FoodTruckId;
    const userId = req.user?.id || req.userId;

    const truck = await FoodTruck.findByPk(foodTruckId);
    if (!truck) return res.status(404).json({ error: true, message: 'Food Truck no encontrado' });

    if (!(await canManageTruck(truck, userId))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    const newLocation = await Location.create({
      address: req.body.address,
      schedule: buildSchedule(req.body),
      dayOfWeek: req.body.dayOfWeek,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      isActive: req.body.isActive,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      foodTruckId,
      FoodTruckId: foodTruckId
    });

    res.status(201).json({ error: false, message: 'Ubicacion anadida', data: newLocation });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al anadir ubicacion', details: error.message });
  }
};

const getTruckLocations = async (req, res) => {
  try {
    const { truckId } = req.params;
    const locations = await Location.findAll({
      where: { foodTruckId: truckId },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    res.status(200).json({ error: false, data: locations });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al obtener ubicaciones' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const location = await Location.findByPk(id, { include: { model: FoodTruck } });
    if (!location) return res.status(404).json({ error: true, message: 'Ubicacion no encontrada' });

    if (!(await canManageTruck(location.FoodTruck, userId))) {
      return res.status(403).json({ error: true, message: 'No tienes permiso para editar esta ubicacion' });
    }

    const allowedFields = ['address', 'dayOfWeek', 'startTime', 'endTime', 'isActive', 'latitude', 'longitude'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.schedule !== undefined || req.body.startTime !== undefined || req.body.endTime !== undefined) {
      updates.schedule = buildSchedule({
        schedule: req.body.schedule,
        startTime: req.body.startTime || location.startTime,
        endTime: req.body.endTime || location.endTime
      });
    }

    await location.update(updates);
    res.status(200).json({ error: false, message: 'Ubicacion actualizada', data: location });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al actualizar ubicacion', details: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    const location = await Location.findByPk(id, { include: { model: FoodTruck } });
    if (!location) return res.status(404).json({ error: true, message: 'Ubicacion no encontrada' });

    if (!(await canManageTruck(location.FoodTruck, userId))) {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }

    await location.destroy();
    res.status(200).json({ error: false, message: 'Ubicacion eliminada' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al eliminar ubicacion', details: error.message });
  }
};

module.exports = { addLocation, getTruckLocations, updateLocation, deleteLocation };
