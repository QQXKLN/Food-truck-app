const Joi = require('joi');

const orderIdParamSchema = Joi.object({
  orderId: Joi.number().integer().positive().required()
});

const truckOrderParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const orderItemSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().max(120),
  price: Joi.number().positive().precision(2),
  foodTruckId: Joi.number().integer().positive(),
  quantity: Joi.number().integer().positive().default(1)
}).unknown(true);

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  total: Joi.number().positive().precision(2).required(),
  paymentMethod: Joi.string().valid('Efectivo', 'Transferencia', 'Tarjeta').required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('Pendiente', 'Listo', 'Entregado').required()
});

module.exports = {
  orderIdParamSchema,
  truckOrderParamSchema,
  createOrderSchema,
  updateOrderStatusSchema
};
