const Joi = require('joi');

const contaSchema = Joi.object({
  data_criacao: Joi.date().optional().messages({
    'date.base': 'O campo data_criacao deve ser uma data válida.'
  }),
  produto: Joi.string().required().messages({
    'any.required': 'O campo produto é obrigatório.',
    'string.base': 'O campo produto deve ser uma string.'
  }),
  banco_codigo: Joi.string().required().messages({
    'any.required': 'O campo banco_codigo é obrigatório.',
    'string.base': 'O campo banco_codigo deve ser uma string.'
  }),
  cedente_id: Joi.number().integer().required().messages({
    'any.required': 'O campo cedente_id é obrigatório.',
    'number.base': 'O campo cedente_id deve ser um número inteiro.'
  }),
  status: Joi.string().required().messages({
    'any.required': 'O campo status é obrigatório.',
    'string.base': 'O campo status deve ser uma string.'
  }),
  configuracao_notificacao: Joi.object().optional().allow(null).messages({
    'object.base': 'O campo configuracao_notificacao deve ser um objeto JSON.'
  })
});

module.exports = contaSchema;