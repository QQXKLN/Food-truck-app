const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  idParamSchema,
  createFoodTruckSchema,
  updateFoodTruckSchema
} = require('../validators/foodTruckValidator');
const {
  orderIdParamSchema,
  truckOrderParamSchema,
  createOrderSchema,
  updateOrderStatusSchema
} = require('../validators/orderValidator');
const {
  dailyMenuParamSchema,
  dailyMenuQuerySchema,
  upsertDailyMenuItemSchema
} = require('../validators/dailyMenuValidator');

router.get('/mis-compras', authMiddleware, orderController.getMyPurchases);
router.get('/me', authMiddleware, foodTruckController.getMyFoodTrucks);

router.get('/', foodTruckController.getAllFoodTrucks);
router.get(
  '/:id/daily-menu',
  validateRequest(dailyMenuParamSchema, 'params'),
  validateRequest(dailyMenuQuerySchema, 'query'),
  foodTruckController.getDailyMenu
);
router.post(
  '/:id/daily-menu',
  authMiddleware,
  validateRequest(dailyMenuParamSchema, 'params'),
  validateRequest(upsertDailyMenuItemSchema),
  foodTruckController.upsertDailyMenuItem
);
router.get('/:id', validateRequest(idParamSchema, 'params'), foodTruckController.getFoodTruckById);

router.post('/', authMiddleware, validateRequest(createFoodTruckSchema), foodTruckController.createFoodTruck);
router.put(
  '/:id',
  authMiddleware,
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateFoodTruckSchema),
  foodTruckController.updateFoodTruck
);
router.delete('/:id', authMiddleware, validateRequest(idParamSchema, 'params'), foodTruckController.deleteFoodTruck);

router.post(
  '/:id/order',
  authMiddleware,
  validateRequest(truckOrderParamSchema, 'params'),
  validateRequest(createOrderSchema),
  orderController.placeOrder
);
router.get('/:id/orders', authMiddleware, validateRequest(truckOrderParamSchema, 'params'), orderController.getTruckOrders);
router.put(
  '/orders/:orderId/status',
  authMiddleware,
  validateRequest(orderIdParamSchema, 'params'),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

module.exports = router;
