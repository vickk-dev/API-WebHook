const Joi = require('joi');

const webhockReprocessadoSchema = Joi.object({
  data: Joi.object().required().messages({
    'any.required': 'O campo data é obrigatório.',
    'object.base': 'O campo data deve ser um objeto JSON.'
  }),
  data_criacao: Joi.date().optional().messages({
    'date.base': 'O campo data_criacao deve ser uma data válida.'
  }),
  cedente_id: Joi.number().integer().required().messages({
    'any.required': 'O campo cedente_id é obrigatório.',
    'number.base': 'O campo cedente_id deve ser um número inteiro.'
  }),
  kind: Joi.string().required().messages({
    'any.required': 'O campo kind é obrigatório.',
    'string.base': 'O campo kind deve ser uma string.'
  }),
  type: Joi.string().required().messages({
    'any.required': 'O campo type é obrigatório.',
    'string.base': 'O campo type deve ser uma string.'
  }),
  servico_id: Joi.alternatives().try(
    Joi.array(),
    Joi.object(),
    Joi.string()
  ).optional().messages({
    'alternatives.types': 'O campo servico_id deve ser um JSON válido (array, objeto ou string).'
  }),
  protocolo: Joi.string().required().messages({
    'any.required': 'O campo protocolo é obrigatório.',
    'string.base': 'O campo protocolo deve ser uma string.'
  })
});

module.exports = webhockReprocessadoSchema;