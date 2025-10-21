const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const { reenviarValidator } = require('../validators/reenviarValidator');
const { testeSituacoes } = require('../utils/testeSituacoes');
const { WebhookReprocessado } = require('../models'); 
const WebhookService = require('../services/webhookService');

async function ReenviarService(data) {
// Validação inicial com Joi <Gabriel Martins>
  const { error, value } = reenviarValidator.validate(data, { abortEarly: false });
  if (error) throw { status: 400, message: error.details.map((d) => d.message) };

  const { product, ids, kind, type } = value;

  // Validação de Produtos <Gabriel Martins>
  if (new Set(ids.map((id) => id[0])).size > 1) {
    throw {
      status: 422,
      message: "Não é possível enviar notificações de produtos diferentes no mesmo UUID.",
    };
  }

  // INÍCIO DA LÓGICA DE CACHE REDIS <Gabriel Mendes>
  const cacheKey = `reenvio:${product}:${kind}:${type}:${JSON.stringify(ids)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    throw {
      status: 429,
      message: "Já existe uma requisição idêntica em processamento. Aguarde 1 hora para reenviar.",
    };
  }

  await redis.setEx(cacheKey, 3600, 'locked');

  // Validação de Situações <Gabriel Martins>
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
    //PROCESSAMENTO PRINCIPAL <Gabriel Mendes e Felipe Vasconcelos>
    const protocolo = await WebhookService.enviarWebhook({ uuid, product, ids, kind, type });

    if (!protocolo) {
      await redis.del(cacheKey);
      console.error(`[ERRO PROCESSAMENTO] Falha ao gerar protocolo para UUID: ${uuid}`);
      throw {
        status: 400,
        message: "Não foi possível gerar a notificação. Tente novamente mais tarde.",
      };
    }

    // Armazenamento Pós-Sucesso <Luiz>
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
    // Erro Genérico de Processamento <Felipe Vasconcelos>
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
