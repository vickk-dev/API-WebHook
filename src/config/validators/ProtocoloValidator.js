const Joi = require('joi');

// Validador para listagem de protocolos (GET /protocolo)
const listagemProtocolosSchema = Joi.object({
  // Filtros obrigatórios
  start_date: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'O campo start_date é obrigatório.',
      'date.base': 'O campo start_date deve ser uma data válida.',
      'date.format': 'O campo start_date deve estar no formato ISO 8601.'
    }),
  
  end_date: Joi.date()
    .iso()
    .required()
    .min(Joi.ref('start_date'))
    .messages({
      'any.required': 'O campo end_date é obrigatório.',
      'date.base': 'O campo end_date deve ser uma data válida.',
      'date.format': 'O campo end_date deve estar no formato ISO 8601.',
      'date.min': 'A data final não pode ser menor que a data inicial.'
    }),

  // Filtros opcionais
  product: Joi.string()
    .valid('boleto', 'pagamento', 'pix')
    .optional()
    .messages({
      'string.base': 'O campo product deve ser uma string.',
      'any.only': 'O campo product deve ser boleto, pagamento ou pix.'
    }),

  id: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string()
    )
    .optional()
    .messages({
      'alternatives.types': 'O campo id deve ser uma string ou array de strings.'
    }),

  kind: Joi.string()
    .valid('webhook', 'evento', 'agendamento')
    .optional()
    .messages({
      'string.base': 'O campo kind deve ser uma string.',
      'any.only': 'O campo kind deve ser webhook, evento ou agendamento.'
    }),

  type: Joi.string()
    .valid('disponivel', 'cancelado', 'pago')
    .optional()
    .messages({
      'string.base': 'O campo type deve ser uma string.',
      'any.only': 'O campo type deve ser disponivel, cancelado ou pago.'
    })
}).custom((value, helpers) => {
  // Validação customizada: intervalo não pode ser maior que 31 dias
  const startDate = new Date(value.start_date);
  const endDate = new Date(value.end_date);
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 31) {
    return helpers.error('any.custom', { 
      message: 'O intervalo entre start_date e end_date não pode ser maior que 31 dias.' 
    });
  }
  
  return value;
});

// Validador para consulta individual de protocolo (GET /protocolo/:uuid)
const consultaIndividualSchema = Joi.object({
  uuid: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'O campo uuid é obrigatório.',
      'string.base': 'O campo uuid deve ser uma string.',
      'string.guid': 'O uuid fornecido não é válido.'
    })
});

module.exports = {
  listagemProtocolosSchema,
  consultaIndividualSchema
};
