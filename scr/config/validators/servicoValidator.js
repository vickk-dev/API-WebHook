const Joi = require('joi');

const servicoSchema = Joi.object({
  data_criacao: Joi.date().optional().messages({
    'date.base': 'O campo data_criacao deve ser uma data válida.'
  }),
  convenio_id: Joi.number().integer().required().messages({
    'any.required': 'O campo convenio_id é obrigatório.',
    'number.base': 'O campo convenio_id deve ser um número inteiro.'
  }),
  status: Joi.string().required().messages({
    'any.required': 'O campo status é obrigatório.',
    'string.base': 'O campo status deve ser uma string.'
  })
});

module.exports = servicoSchema;