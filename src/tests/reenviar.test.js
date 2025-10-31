const request = require('supertest');
const app = require('../app');
const redis = require('../config/redis');
const { Cedente } = require('../Infrastructure/Persistence/Sequelize/models');

describe('POST /api/reenviar', () => {

  beforeAll(async () => {
    await Cedente.create({
      id: 1,
      nome: 'Cedente Teste',
      softwarehouse_id: 1 
    });
  });

  afterAll(async () => {
    await Cedente.destroy({ where: { id: 1 } });
    await redis.quit();
  });

  it('Deve criar um novo reenvio com sucesso (201)', async () => {
    const response = await request(app)
      .post('/api/reenviar')
      .set('Content-Type', 'application/json')
      .send({
        product: 'boleto',
        ids: ['BOL1001', 'BOL1002'],
        kind: 'webhook',
        type: 'disponivel',
        cedente_id: 1
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('protocolo');
    expect(response.body).toHaveProperty('uuid');
    expect(response.body.message).toBe('Reenvio criado com sucesso!');
  });

  it('Deve retornar erro se enviar novamente com os mesmos dados (429)', async () => {
    const payload = {
      product: 'boleto',
      ids: ['BOL2001', 'BOL2002'],
      kind: 'webhook',
      type: 'disponivel',
      cedente_id: 1
    };

    await request(app).post('/api/reenviar').send(payload);
    const response = await request(app).post('/api/reenviar').send(payload);

    expect(response.statusCode).toBe(429);
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

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatch(/diverge do tipo de notificação solicitado/);
  });
});
