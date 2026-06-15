const Joi = require('joi');

const orderSchema = Joi.object({
    items: Joi.array().required(),
    total: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('Efectivo', 'Transferencia', 'Tarjeta').required()
});

const validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body);
    if (error) return res.status(422).json({ error: true, message: error.details[0].message });
    next();
};

module.exports = { validateOrder };