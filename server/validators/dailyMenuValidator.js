const Joi = require('joi');

const dailyMenuParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const dailyMenuDishParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  dishId: Joi.number().integer().positive().required()
});

const dailyMenuQuerySchema = Joi.object({
  date: Joi.string().isoDate()
});

const upsertDailyMenuItemSchema = Joi.object({
  dishId: Joi.number().integer().positive().required(),
  date: Joi.string().isoDate(),
  stock: Joi.number().integer().min(0).required(),
  isAvailable: Joi.boolean().default(true)
});

module.exports = {
  dailyMenuParamSchema,
  dailyMenuDishParamSchema,
  dailyMenuQuerySchema,
  upsertDailyMenuItemSchema
};
