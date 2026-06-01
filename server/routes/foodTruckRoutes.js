const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');

// Ruta para obtener todos los camiones (GET)
router.get('/', foodTruckController.getAllFoodTrucks);

// Ruta para crear un nuevo camión (POST)
router.post('/', foodTruckController.createFoodTruck);

module.exports = router;