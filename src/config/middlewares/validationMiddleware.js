const Joi = require('joi');

/**
 * Middleware de validação para requisições
 * @param {Joi.Schema} schema - Schema Joi para validação
 * @param {string} source - Origem dos dados ('body', 'query', 'params')
 */
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        let dataToValidate;
        
        switch(source) {
            case 'query':
                dataToValidate = req.query;
                break;
            case 'params':
                dataToValidate = req.params;
                break;
            case 'body':
            default:
                dataToValidate = req.body;
                break;
        }

        const { error, value } = schema.validate(dataToValidate, { 
            abortEarly: false,
            stripUnknown: true 
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ 
                error: true,
                message: 'Erro de validação', 
                details: errorMessages 
            });
        }

        // Atualiza os dados validados na requisição
        if (source === 'query') {
            req.query = value;
        } else if (source === 'params') {
            req.params = value;
        } else {
            req.body = value;
        }

        next();
    };
};

module.exports = { validateRequest };
