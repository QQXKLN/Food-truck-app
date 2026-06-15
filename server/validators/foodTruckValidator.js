const Joi = require('joi');

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const createFoodTruckSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).required(),
  logo: Joi.string().trim().max(500).allow('', null)
});

const updateFoodTruckSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().max(1000),
  logo: Joi.string().trim().max(500).allow('', null)
}).min(1);

module.exports = {
  idParamSchema,
  createFoodTruckSchema,
  updateFoodTruckSchema
};
