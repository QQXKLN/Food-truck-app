const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/', authenticate, locationController.addLocation);
router.get('/truck/:truckId', locationController.getTruckLocations);
router.put('/:id', authenticate, locationController.updateLocation); 
router.delete('/:id', authenticate, locationController.deleteLocation);

module.exports = router;