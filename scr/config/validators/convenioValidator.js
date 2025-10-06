const Joi = require('joi');

const convenioSchema = Joi.object({
  numero_convenio: Joi.string().required().messages({
    'any.required': 'O campo numero_convenio é obrigatório.',
    'string.base': 'O campo numero_convenio deve ser uma string.'
  }),
  data_criacao: Joi.date().optional().messages({
    'date.base': 'O campo data_criacao deve ser uma data válida.'
  }),
  conta_id: Joi.number().integer().required().messages({
    'any.required': 'O campo conta_id é obrigatório.',
    'number.base': 'O campo conta_id deve ser um número inteiro.'
  })
});

module.exports = convenioSchema;