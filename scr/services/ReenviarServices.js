const redis = require("../config/redisClient");
const reenviarValidator = require("../config/validators/ReenviarValidator");

// Exemplo Teste
async function testeSituacoes(product, ids) {
  const mockStatus = {
    boleto: { "B001": "REGISTRADO", "B002": "LIQUIDADO", "B003": "BAIXADO" },
    pagamento: { "P001": "PAID", "P002": "SCHEDULED" },
    pix: { "PX001": "ACTIVE", "PX002": "REJECTED" },
  };
  return ids.map((id) => ({ id, status: mockStatus[product][id] || "DESCONHECIDO" }));
}

async function ReenviarService(data) {
  const { 
    error, value } = reenviarValidator.validate(data, { abortEarly: false });
    if (error) throw { status: 400, message: error.details.map((d) => d.message)
  };

  const { product, ids, kind, type } = value;

  // VALIDAÇÃO PRODUTO
  if (new Set(ids.map((id) => id[0])).size > 1) {
    throw {
      status: 422,
      message: "Não é possível enviar notificações de produtos diferentes no mesmo UUID.",
    };
  }

  // VALIDAÇÃO DE SITUAÇÃO 
  const tabelaSituacoes = {
    boleto: {
      disponivel: ["REGISTRADO"],
      cancelado: ["BAIXADO"],
      pago: ["LIQUIDADO"],
    },
    pagamento: {
      disponivel: ["SCHEDULED"],
      cancelado: ["CANCELLED"],
      pago: ["PAID"],
    },
    pix: {
      disponivel: ["ACTIVE"],
      cancelado: ["REJECTED"],
      pago: ["LIQUIDATED"],
    },
  };

  const situacoesEsperadas = tabelaSituacoes[product][type];
  const resultados = await testeSituacoes(product, ids);

  const divergentes = resultados
    .filter((r) => !situacoesEsperadas.includes(r.status))
    .map((r) => r.id);

  if (divergentes.length > 0) {
    throw {
      status: 422,
      message: `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`,
      idsInvalidos: divergentes,
    };
  }

}

module.exports = { ReenviarService };
