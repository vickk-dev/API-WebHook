const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');

const WebhookService = {
  async enviarWebhook({ uuid, product, ids, kind, type }) {
    try {
      const configuracao = {
        url: 'https://webhook.site/CHAVEALEATORIA',
        cancelado: true,
        pago: true,
        disponivel: true,
        ativado: true,
        headers_adicionais: [
          { 'x-empresa': '', 'content-type': 'application/json' },
        ],
      };

      if (!configuracao.ativado) {
        console.log(`[WebhookService] Notificação desativada para ${product}.`);
        return null;
      }

      console.log(`[WebhookService] Enviando webhook "${type}" para "${product}"...`);
      console.log({
        uuid,
        product,
        kind,
        type,
        ids,
      });

      const protocolo = uuidv4();

      await redis.setEx(
        `protocolo:${protocolo}`,
        3600,
        JSON.stringify({
          uuid,
          product,
          kind,
          type,
          ids,
          status: 'sent',
        })
      );

      console.log(`Webhook enviado com sucesso: ${protocolo}`);

      return protocolo;
    } catch (err) {
      console.error(`Erro no envio: ${err.message}`, {
        uuid,
        product,
        kind,
        type,
        ids,
        timestamp: new Date().toISOString(),
      });
      return null;
    }
  },
};

module.exports = WebhookService;
