const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');
const authenticate = require('../middlewares/authMiddleware');


// Catálogo público
router.get('/', foodTruckController.getAllFoodTrucks);

// Rutas privadas (Protegidas por token)
router.get('/me', authenticate, foodTruckController.getMyFoodTrucks);
router.post('/', authenticate, foodTruckController.createFoodTruck);
router.post('/:id/order', foodTruckController.placeOrder);
router.put('/:id', authenticate, foodTruckController.updateFoodTruck);    
router.delete('/:id', authenticate, foodTruckController.deleteFoodTruck);


router.get('/:id', foodTruckController.getFoodTruckById);

module.exports = router;