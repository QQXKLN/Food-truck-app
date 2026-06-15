const Joi = require('joi');

const dishIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const truckIdParamSchema = Joi.object({
  truckId: Joi.number().integer().positive().required()
});

const createDishSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).allow('', null),
  price: Joi.number().positive().precision(2).required(),
  foodTruckId: Joi.number().integer().positive().required(),
  isAvailable: Joi.boolean().default(true)
});

const updateDishSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().max(1000).allow('', null),
  price: Joi.number().positive().precision(2),
  isAvailable: Joi.boolean()
}).min(1);

module.exports = {
  dishIdParamSchema,
  truckIdParamSchema,
  createDishSchema,
  updateDishSchema
};
