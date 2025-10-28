const Joi = require("joi");

const ReenviarSchema = Joi.object({
    product: Joi.string()
        .valid("boleto", "pagamento", "pix")
        .required(),
    ids: Joi.array()
        .items(Joi.string())
        .max(30)
        .required(),
    kind: Joi.string() // Tirar duvida com o professor
        .valid("webhook")
        .required(),
    type: Joi.string()
        .valid("disponivel", "cancelado", "pago")
        .required(),
    cedente_id: Joi.number().integer().optional().allow(null) 
});

    module.exports = ReenviarSchema; // tava modelu