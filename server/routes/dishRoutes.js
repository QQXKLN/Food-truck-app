const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authenticate = require('../middlewares/authMiddleware');


router.get('/truck/:truckId', dishController.getDishes);


router.post('/', authenticate, dishController.createDish);
router.put('/:id', authenticate, dishController.updateDish);
router.delete('/:id', authenticate, dishController.deleteDish);

module.exports = router;