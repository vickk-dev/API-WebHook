const redis = require("../config/redisClient");
const reenviarValidator = require("../config/validators/ReenviarValidator");
const logger = require("../config/logger"); 
const crypto = require("crypto");


async function testeSituacoes(product, ids) {
  const mockStatus = {
    boleto: { "B001": "REGISTRADO", "B002": "LIQUIDADO", "B003": "BAIXADO" },
    pagamento: { "P001": "PAID", "P002": "SCHEDULED" },
    pix: { "PX001": "ACTIVE", "PX002": "REJECTED" },
  };
  return ids.map((id) => ({ id, status: mockStatus[product][id] || "DESCONHECIDO" }));
}

async function ReenviarService(data) {
  
  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');

  try {
    
    const cachedRequest = await redis.get(`request:${requestHash}`);
    if (cachedRequest) {
      logger.info('Duplicate request detected:', {
        requestHash,
        timestamp: '2025-10-21 17:20:42',
        user: 'Gabriel-S-Mendes'
      });
      throw {
        status: 409,
        message: 'Uma requisição idêntica foi processada na última hora. Tente novamente mais tarde.'
      };
    }

  const { 
    error, value } = reenviarValidator.validate(data, { abortEarly: false });
    if (error) throw { status: 400, message: error.details.map((d) => d.message)
  };

  const { product, ids, kind, type } = value;

 
  if (new Set(ids.map((id) => id[0])).size > 1) {
    throw {
      status: 422,
      message: "Não é possível enviar notificações de produtos diferentes no mesmo UUID.",
    };
  }


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


  await redis.setex(
    `request:${requestHash}`,
    3600, 
    JSON.stringify({
      ...data,
      processedAt: '2025-10-21 17:20:42',
      user: 'Gabriel-S-Mendes'
    })
  );

 
  logger.info('Request processed successfully:', {
    requestHash,
    timestamp: '2025-10-21 17:20:42',
    user: 'Gabriel-S-Mendes',
    data
  });

  return { success: true };

  } catch (error) {
   
    logger.error('Request processing failed:', {
      requestHash,
      timestamp: '2025-10-21 17:20:42',
      user: 'Gabriel-S-Mendes',
      error: {
        message: error.message,
        status: error.status || 500,
        stack: error.stack
      },
      data
    });
    throw error;
  }
}

module.exports = { ReenviarService };