const express = require('express');
const router = express.Router();
const foodTruckController = require('../controllers/foodTruckController');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// RUTAS ESPECÍFICAS PRIMERO
router.get('/mis-compras', authMiddleware, orderController.getMyPurchases);
router.get('/me', authMiddleware, foodTruckController.getMyFoodTrucks);

// RUTAS PÚBLICAS
router.get('/', foodTruckController.getAllFoodTrucks);
router.get('/:id', foodTruckController.getFoodTruckById);

// RUTAS DE GESTIÓN (Privadas)
router.post('/', authMiddleware, foodTruckController.createFoodTruck);
router.put('/:id', authMiddleware, foodTruckController.updateFoodTruck);
router.delete('/:id', authMiddleware, foodTruckController.deleteFoodTruck);

// RUTAS DE PEDIDOS
router.post('/:id/order', authMiddleware, orderController.placeOrder);
router.get('/:id/orders', authMiddleware, orderController.getTruckOrders);
router.put('/orders/:orderId/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;