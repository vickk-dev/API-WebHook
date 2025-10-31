const request = require('supertest');
const app = require('../app');
const redis = require('../config/redis');
const { Cedente, SoftwareHouse } = require('../Infrastructure/Persistence/Sequelize/models');

jest.mock('../services/WebhookService', () => ({
  enviarWebhook: jest.fn().mockResolvedValue({ success: true }),
}));

describe('POST /api/reenviar', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(3001);

    await SoftwareHouse.create({
      id: 1,
      cnpj: '11222333000181',
      token: 'token_softwarehouse',
      status: 'ativo'
    });

    await Cedente.create({
      id: 1,
      nome: 'Cedente Teste',
      cnpj: '12345678000199',
      token: 'token_teste_123',
      status: 'ativo',
      softwarehouse_id: 1
    });

    if (redis.status !== 'ready') await redis.connect();
  });

  afterAll(async () => {
    await Cedente.destroy({ where: {}, truncate: true, cascade: true });
    await SoftwareHouse.destroy({ where: {}, truncate: true, cascade: true });

    if (redis.status !== 'end' && redis.status !== 'close') await redis.quit();
    await server.close();
  });

  it('Deve criar um novo reenvio com sucesso (201 ou 200)', async () => {
    const response = await request(app)
      .post('/api/reenviar')
      .send({
        product: 'boleto',
        ids: ['BOL1001', 'BOL1002'],
        kind: 'webhook',
        type: 'disponivel',
        cedente_id: 1
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('uuid');
    expect(response.body).toHaveProperty('protocolo');
  });

  it('Deve retornar erro se enviar novamente com os mesmos dados (429)', async () => {
    const payload = {
      product: 'boleto',
      ids: ['BOL2001', 'BOL2002'],
      kind: 'webhook',
      type: 'disponivel',
      cedente_id: 1
    };

    // Primeiro envio
    await request(app).post('/api/reenviar').send(payload);

    // Segundo envio - duplicidade
    const response = await request(app).post('/api/reenviar').send(payload);

    expect(response.status).toBe(429);
    expect(response.body.message).toMatch(/Aguarde 1 hora/);
  });

  it('Deve retornar erro 422 se tipo não condizer com a situação', async () => {
    const response = await request(app)
      .post('/api/reenviar')
      .send({
        product: 'boleto',
        ids: ['BOL3001'],
        kind: 'webhook',
        type: 'pago',
        cedente_id: 1
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toMatch(/diverge do tipo de notificação solicitado/);
  });

  it('Deve retornar erro 422 para IDs inválidos', async () => {
    const response = await request(app)
      .post('/api/reenviar')
      .send({
        product: 'boleto',
        ids: ['BOL9999'],
        kind: 'webhook',
        type: 'disponivel',
        cedente_id: 1
      });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('idsInvalidos');
  });
});