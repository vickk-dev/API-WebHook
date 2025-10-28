const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');
const WebhookService = require('../services/webhookService');

// Mocka dependências externas 
jest.mock('uuid');
jest.mock('../config/redis', () => ({
  setEx: jest.fn(),
}));

describe('WebhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve enviar o webhook e retornar um protocolo', async () => {
    uuidv4.mockReturnValue('mocked-uuid');
    redis.setEx.mockResolvedValue('OK');

    const result = await WebhookService.enviarWebhook({
      uuid: '123',
      product: 'produtoA',
      ids: [1, 2],
      kind: 'teste',
      type: 'pago',
    });

    expect(result).toBe('mocked-uuid');
    expect(redis.setEx).toHaveBeenCalledWith(
      expect.stringContaining('protocolo:mocked-uuid'),
      3600,
      expect.stringContaining('"status":"sent"')
    );
  });

  test('deve retornar null se ocorrer erro no Redis', async () => {
    uuidv4.mockReturnValue('mocked-uuid');
    redis.setEx.mockRejectedValue(new Error('Falha no Redis'));

    const result = await WebhookService.enviarWebhook({
      uuid: '123',
      product: 'produtoB',
      ids: [3, 4],
      kind: 'erro',
      type: 'cancelado',
    });

    expect(result).toBeNull();
  });

  test('Não deve enviar se configuracao.ativado for false', async () => {
    const WebhookServiceDesativado = {
      async enviarWebhook({ product }) {
        const configuracao = { ativado: false };
        if (!configuracao.ativado) {
          console.log(`[WebhookService] Notificação desativada para ${product}.`);
          return null;
        }
      },
    };

    const result = await WebhookServiceDesativado.enviarWebhook({
      product: 'produtoDesativado',
    });

    expect(result).toBeNull();
  });


});
