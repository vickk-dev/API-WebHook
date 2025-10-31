
const request = require('supertest');
const app = require('../app');
const sequelize = require('../../../src/Infrastructure/Persistence/Sequelize/models/index').sequelize;
const { SoftwareHouse, Cedente } = require('../../../src/Infrastructure/Persistence/Sequelize/models');

describe('Teste de Integração: authMiddleware', () => {

    
    let shTest;
    let cedenteTest;

    
    beforeAll(async () => {
       
        await sequelize.sync({ force: true }); 

        
        shTest = await SoftwareHouse.create({
            cnpj: '11111111000111',
            token: 'TOKEN_VALIDO_SH',
            status: 'ativo',
            
        });

        cedenteTest = await Cedente.create({
            cnpj: '22222222000122',
            token: 'TOKEN_VALIDO_CEDENTE',
            status: 'ativo',
            softwarehouse_id: shTest.id,
            
        });
    });


    afterAll(async () => {
        await sequelize.close();
    });


    it('deve bloquear (401) se o x-api-token-sh for inválido', async () => {
        
        
        const response = await request(app)
            .post('/reenviar') // Rota real que usa o middleware
            [cite_start].set('x-api-cnpj-sh', shTest.cnpj) 
            [cite_start].set('x-api-token-sh', 'TOKEN_FALSO_12345') 
            [cite_start].set('x-api-cnpj-cedente', cedenteTest.cnpj) 
            .set('x-api-token-cedente', cedenteTest.token); [cite_start]

       
        expect(response.body.message).toBe("Não autorizado");
    });

    it('deve permitir (passar do middleware) se os headers forem válidos', async () => {
        

        const response = await request(app)
            .post('/reenviar')
            .set('x-api-cnpj-sh', shTest.cnpj)
            .set('x-api-token-sh', shTest.token)
            .set('x-api-cnpj-cedente', cedenteTest.cnpj)
            .set('x-api-token-cedente', cedenteTest.token)
            .send({}); 
       
        expect(response.status).toBe(400); 
    
});
});