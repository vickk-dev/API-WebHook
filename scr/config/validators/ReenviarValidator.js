const Joi = require("joi");

const reenviarSchema = Joi.object({
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
});

    modelu.exports = reenviarSchema;