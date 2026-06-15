const Joi = require('joi');

const locationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const truckIdParamSchema = Joi.object({
  truckId: Joi.number().integer().positive().required()
});

const createLocationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(250).required(),
  schedule: Joi.string().trim().max(250).allow('', null),
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  isActive: Joi.boolean().default(true),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  FoodTruckId: Joi.number().integer().positive(),
  foodTruckId: Joi.number().integer().positive()
}).or('FoodTruckId', 'foodTruckId');

const updateLocationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(250),
  schedule: Joi.string().trim().min(3).max(250),
  dayOfWeek: Joi.number().integer().min(0).max(6),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  isActive: Joi.boolean(),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null)
}).min(1);

module.exports = {
  locationIdParamSchema,
  truckIdParamSchema,
  createLocationSchema,
  updateLocationSchema
};
