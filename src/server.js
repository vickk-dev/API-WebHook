const app = require('./app');
const sequelize = require('./Infrastructure/Persistence/Sequelize/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        process.exit(1);
    }
}

startServer();