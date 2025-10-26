const Joi = require('joi');

const softwareHouseSchema = Joi.object({
  data_criacao: Joi.date().optional().messages({
    'date.base': 'O campo data_criacao deve ser uma data válida.'
  }),
  cnpj: Joi.string().length(14).pattern(/^\d+$/).required().messages({
    'any.required': 'O campo cnpj é obrigatório.',
    'string.length': 'O campo cnpj deve ter exatamente 14 dígitos.',
    'string.pattern.base': 'O campo cnpj deve conter apenas números.'
  }),
  token: Joi.string().required().messages({
    'any.required': 'O campo token é obrigatório.',
    'string.base': 'O campo token deve ser uma string.'
  }),
  status: Joi.string().valid('ativo', 'inativo').required().messages({
    'any.required': 'O campo status é obrigatório.',
    'any.only': 'O campo status deve ser "ativo" ou "inativo".'
  })
});

module.exports = softwareHouseSchema;