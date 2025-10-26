const Joi = require('joi');

const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = source === 'body' ? req.body : req.query;
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: 'Erro de validação', details: `${errorMessages}` });
        }
        next();
    };
};
module.exports = { validateRequest };
