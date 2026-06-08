const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');
const authenticate = require('../middlewares/authMiddleware');


router.get('/', foodTruckController.getAllFoodTrucks);


router.post('/', authenticate, foodTruckController.createFoodTruck);
router.put('/:id', authenticate, foodTruckController.updateFoodTruck);    
router.delete('/:id', authenticate, foodTruckController.deleteFoodTruck);

module.exports = router;