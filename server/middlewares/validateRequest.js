const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      convert: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(422).json({
        error: true,
        message: 'Datos de entrada invalidos',
        code: 'VALIDATION_ERROR',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validateRequest;
