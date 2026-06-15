const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authenticate = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  locationIdParamSchema,
  truckIdParamSchema,
  createLocationSchema,
  updateLocationSchema
} = require('../validators/locationValidator');

router.post('/', authenticate, validateRequest(createLocationSchema), locationController.addLocation);
router.get('/truck/:truckId', validateRequest(truckIdParamSchema, 'params'), locationController.getTruckLocations);
router.put(
  '/:id',
  authenticate,
  validateRequest(locationIdParamSchema, 'params'),
  validateRequest(updateLocationSchema),
  locationController.updateLocation
);
router.delete('/:id', authenticate, validateRequest(locationIdParamSchema, 'params'), locationController.deleteLocation);

module.exports = router;
