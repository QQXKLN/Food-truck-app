const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authenticate = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  dishIdParamSchema,
  truckIdParamSchema,
  createDishSchema,
  updateDishSchema
} = require('../validators/dishValidator');

router.get('/truck/:truckId', validateRequest(truckIdParamSchema, 'params'), dishController.getDishes);
router.post('/', authenticate, validateRequest(createDishSchema), dishController.createDish);
router.put(
  '/:id',
  authenticate,
  validateRequest(dishIdParamSchema, 'params'),
  validateRequest(updateDishSchema),
  dishController.updateDish
);
router.delete('/:id', authenticate, validateRequest(dishIdParamSchema, 'params'), dishController.deleteDish);

module.exports = router;
