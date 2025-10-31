const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const reenviarValidator = require('../config/validators/ReenviarValidator');
const { testeSituacoes } = require('../utils/testeSituacoes');
const { WebhookReprocessado } = require('../Infrastructure/Persistence/Sequelize/models');
const WebhookService = require('../services/webhookService');

async function ReenviarService(data) {
  // Validação inicial com Joi
  const { error, value } = reenviarValidator.validate(data, { abortEarly: false });
  if (error) {
    throw { status: 400, message: error.details.map((d) => d.message) };
  }

  const { product, ids, kind, type } = value;

  // Garante que todos IDs pertencem ao mesmo produto
  if (new Set(ids.map((id) => id[0])).size > 1) {
    throw {
      status: 422,
      message: "Não é possível enviar notificações de produtos diferentes no mesmo UUID.",
    };
  }

  // --------- CONTROLE DE CACHE COM REDIS ---------
  const cacheKey = `reenvio:${product}:${kind}:${type}:${JSON.stringify(ids)}`;

  // Verifica se já existe uma requisição igual em processamento
  const cached = await redis.get(cacheKey);
  if (cached) {
    throw {
      status: 429,
      message: "Já existe uma requisição idêntica em processamento. Aguarde 1 hora para reenviar.",
    };
  }

  // Cria a chave com TTL de 3600 segundos (1h)
  await redis.setex(cacheKey, 3600, 'locked');

  // --------- VALIDAÇÃO DE SITUAÇÕES ---------
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
    await redis.del(cacheKey);
    throw {
      status: 422,
      message: `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`,
      idsInvalidos: divergentes,
    };
  }

  const uuid = uuidv4();

  try {
    // PROCESSAMENTO DO WEBHOOK
    const protocolo = await WebhookService.enviarWebhook({ uuid, product, ids, kind, type });

    if (!protocolo) {
      await redis.del(cacheKey);
      throw {
        status: 400,
        message: "Não foi possível gerar a notificação. Tente novamente mais tarde.",
      };
    }

    // Salvando registro no banco
    await WebhookReprocessado.create({
      id: uuid,
      data: data,
      kind,
      type,
      cedente_id: data.cedente_id || null,
      servico_id: JSON.stringify(ids),
      protocolo,
    });

    return {
      message: 'Reenvio criado com sucesso!',
      protocolo,
      uuid,
    };

  } catch (error) {
    await redis.del(cacheKey);

    console.error(`[ERRO GERAL] UUID: ${uuid}`);
    console.error(`Dados da Requisição: ${JSON.stringify(data)}`);
    console.error(error);

    throw {
      status: 400,
      message: "Não foi possível gerar a notificação. Tente novamente mais tarde.",
    };
  }
}

module.exports = { ReenviarService };
