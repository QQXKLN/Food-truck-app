const { Order, FoodTruck } = require('../models');


const placeOrder = async (req, res) => {
  try {
    const { id } = req.params; 
    const { items, paymentMethod, total } = req.body;

    if (!paymentMethod) return res.status(400).json({ error: true, message: 'Método de pago requerido' });

    const newOrder = await Order.create({
      foodTruckId: id,
      userId: req.user ? req.user.id : null,
      total: total,
      paymentMethod: paymentMethod,
      status: 'Pendiente',
      items: JSON.stringify(items)
    });

    res.status(200).json({ error: false, message: 'Pedido recibido', orderId: newOrder.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Error al procesar el pedido' });
  }
};


const getTruckOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { foodTruckId: req.params.id }, 
      order: [['createdAt', 'DESC']] 
    });
    res.status(200).json({ error: false, data: orders });
  } catch (error) { 
    res.status(500).json({ error: true, message: 'Error interno' }); 
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: true, message: 'No encontrado' });
    order.status = req.body.status;
    await order.save();
    res.status(200).json({ error: false, message: 'Actualizado' });
  } catch (error) { res.status(500).json({ error: true, message: 'Error interno' }); }
};


const getMyPurchases = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { userId: req.user.id }, 
      include: [FoodTruck], 
      order: [['createdAt', 'DESC']] 
    });
    res.status(200).json({ error: false, data: orders });
  } catch (error) { 
    console.error("Error en getMyPurchases:", error);
    res.status(500).json({ error: true, message: 'Error interno' }); 
  }
};

module.exports = { 
  placeOrder, 
  getTruckOrders, 
  updateOrderStatus, 
  getMyPurchases 
};