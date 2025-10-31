const Joi = require("joi");

const ReenviarSchema = Joi.object({
    product: Joi.string()
        .valid("boleto", "pagamento", "pix")
        .required(),
    ids: Joi.array()
        .items(Joi.string())
        .max(30)
        .required(),
    kind: Joi.string()
        .valid("webhook")
        .required(),
    type: Joi.string()
        .valid("disponivel", "cancelado", "pago")
        .required(),
    cedente_id: Joi.number().integer().optional().allow(null)
}).unknown(true); 

module.exports = ReenviarSchema;