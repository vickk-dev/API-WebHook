
const request = require('supertest');
const app = require('../app');
const { sequelize, SoftwareHouse, Cedente } = require('../Infrastructure/Persistence/Sequelize/models');

describe('Teste de Integração: authMiddleware', () => {

    
    let shTest;
    let cedenteTest;

    
    beforeAll(async () => {
       
        try {
            // Dropar tipos ENUM existentes antes de recriar as tabelas
            await sequelize.query('DROP TYPE IF EXISTS "enum_softwarehouses_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_SoftwareHouse_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Cedentes_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Cedente_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Contas_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Conta_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Convenios_status" CASCADE;');
            await sequelize.query('DROP TYPE IF EXISTS "enum_Convenio_status" CASCADE;');
        } catch (err) {
            console.log('Erro ao dropar ENUMs (ignorado):', err.message);
        }
        
        // Recriar as tabelas com force: true (recria tudo do zero)
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
            .post('/api/reenviar') // Rota real que usa o middleware
            .set('x-api-cnpj-sh', shTest.cnpj) 
            .set('x-api-token-sh', 'TOKEN_FALSO_12345') 
            .set('x-api-cnpj-cedente', cedenteTest.cnpj) 
            .set('x-api-token-cedente', cedenteTest.token);

       
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Não autorizado");
    });

    it('deve permitir (passar do middleware) se os headers forem válidos', async () => {
        

        const response = await request(app)
            .post('/api/reenviar')
            .set('x-api-cnpj-sh', shTest.cnpj)
            .set('x-api-token-sh', shTest.token)
            .set('x-api-cnpj-cedente', cedenteTest.cnpj)
            .set('x-api-token-cedente', cedenteTest.token)
            .send({}); 
       
        expect(response.status).toBe(400); 
    
});
});