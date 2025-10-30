const { WebhookReprocessado } = require('../Infrastructure/Persistence/Sequelize/models');
const CacheService = require('../services/CacheService');
const ProtocoloService = require('../services/ProtocoloService');
const { Op } = require('sequelize');


jest.mock('../Infrastructure/Persistence/Sequelize/models', () => ({
  WebhookReprocessado: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('../services/CacheService', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

describe('ProtocoloService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarProtocolos', () => {
    it('Deve retornar dados do cache se ja estiverem salvos', async () => {
      const filtros = { start_date: '2024-01-01', end_date: '2024-12-31' };
      const cacheMock = [{ protocolo: 'cached-proto' }];

      CacheService.get.mockResolvedValue(cacheMock);

      const result = await ProtocoloService.listarProtocolos(filtros);

      expect(CacheService.get).toHaveBeenCalled();
      expect(WebhookReprocessado.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(cacheMock);
    });

    it('Deve buscar no banco e salvar no cache se nao houver cache', async () => {
      const filtros = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        product: 'boleto',
        kind: 'webhook',
        type: 'pago',
        id: [1, 2],
      };

      CacheService.get.mockResolvedValue(null);
      WebhookReprocessado.findAll.mockResolvedValue([
        {
          id: 1,
          protocolo: 'uuid-abc',
          kind: 'webhook',
          type: 'pago',
          data: { product: 'boleto' },
          servico_id: [1, 2],
          cedente_id: 10,
          cedente: { id: 10, cnpj: '12345678000199' },
          data_criacao: new Date('2024-01-05'),
        },
      ]);

      const result = await ProtocoloService.listarProtocolos(filtros);

      expect(WebhookReprocessado.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            data_criacao: expect.objectContaining({ [Op.between]: expect.any(Array) }),
            kind: 'webhook',
            type: 'pago',
          }),
        })
      );

      expect(CacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('protocolos:list:'),
        expect.any(Array),
        86400
      );

      expect(result[0]).toHaveProperty('protocolo', 'uuid-abc');
      expect(result[0]).toHaveProperty('product', 'boleto');
    });
  });

  describe('consultarProtocolo', () => {
    it('Deve retornar protocolo do cache se ja estiver armazenado', async () => {
      const uuid = 'uuid-cache';
      const cacheMock = { protocolo: uuid, status: 'sent' };

      CacheService.get.mockResolvedValue(cacheMock);

      const result = await ProtocoloService.consultarProtocolo(uuid);

      expect(CacheService.get).toHaveBeenCalledWith(`protocolo:individual:${uuid}`);
      expect(WebhookReprocessado.findByPk).not.toHaveBeenCalled();
      expect(result).toEqual(cacheMock);
    });

    it('Deve buscar no banco e salvar no cache se status for "sent"', async () => {
      const uuid = 'uuid-db';
      const dbMock = {
        id: 1,
        protocolo: uuid,
        kind: 'webhook',
        type: 'pago',
        data: { product: 'pix', status: 'sent' },
        servico_id: [123],
        cedente_id: 456,
        cedente: { id: 456, cnpj: '00000000000100', status: 'ativo' },
        data_criacao: new Date(),
      };

      CacheService.get.mockResolvedValue(null);
      WebhookReprocessado.findByPk.mockResolvedValue(dbMock);

      const result = await ProtocoloService.consultarProtocolo(uuid);

      expect(WebhookReprocessado.findByPk).toHaveBeenCalledWith(uuid, expect.any(Object));
      expect(CacheService.set).toHaveBeenCalledWith(
        `protocolo:individual:${uuid}`,
        expect.objectContaining({ status: 'sent' }),
        3600
      );

      expect(result).toHaveProperty('product', 'pix');
      expect(result).toHaveProperty('cedente.cnpj', '00000000000100');
    });

    it('Deve lancar erro se protocolo nao for encontrado', async () => {
      CacheService.get.mockResolvedValue(null);
      WebhookReprocessado.findByPk.mockResolvedValue(null);

      await expect(ProtocoloService.consultarProtocolo('nao-existe'))
        .rejects
        .toThrow(/Protocolo (nao|não) encontrado/i);
    });
  });
});

