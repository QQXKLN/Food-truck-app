const Joi = require('joi');

const locationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const truckIdParamSchema = Joi.object({
  truckId: Joi.number().integer().positive().required()
});

const createLocationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(250).required(),
  schedule: Joi.string().trim().min(3).max(250).required(),
  FoodTruckId: Joi.number().integer().positive(),
  foodTruckId: Joi.number().integer().positive()
}).or('FoodTruckId', 'foodTruckId');

const updateLocationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(250),
  schedule: Joi.string().trim().min(3).max(250)
}).min(1);

module.exports = {
  locationIdParamSchema,
  truckIdParamSchema,
  createLocationSchema,
  updateLocationSchema
};
