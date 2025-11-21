const path = require('path');
const fs = require('fs').promises;
const { Conta, Cedente } = require('../Infrastructure/Persistence/Sequelize/models');

class ConfigService {
    constructor() {
        this.configs = {};
        this.configPath = path.join(__dirname, '../config');
    }

    /**
     * Busca a configuração de notificação priorizando a Conta e depois o Cedente
     * @param {number} cedenteId - ID do Cedente
     * @param {number} contaId - ID da Conta (opcional)
     * @returns {Promise<Object|null>} Configuração de notificação ou null
     */
    async getConfiguracaoNotificacao(cedenteId, contaId = null) {
        try {
            // 1. Tenta buscar configuração da Conta (prioridade)
            if (contaId) {
                const conta = await Conta.findByPk(contaId, {
                    attributes: ['configuracao_notificacao']
                });

                if (conta && conta.configuracao_notificacao) {
                    console.log(`[ConfigService] Usando configuração da Conta ${contaId}`);
                    return conta.configuracao_notificacao;
                }
            }

            // 2. Se não achou na Conta, busca do Cedente
            if (cedenteId) {
                const cedente = await Cedente.findByPk(cedenteId, {
                    attributes: ['configuracao_noti']
                });

                if (cedente && cedente.configuracao_noti) {
                    console.log(`[ConfigService] Usando configuração do Cedente ${cedenteId}`);
                    return cedente.configuracao_noti;
                }
            }

            console.log('[ConfigService] Nenhuma configuração encontrada');
            return null;
        } catch (error) {
            console.error('[ConfigService] Erro ao buscar configuração:', error);
            return null;
        }
    }

    async loadConfig(configName) {
        try {
            if (this.configs[configName]) {
                return this.configs[configName];
            }

            const filePath = path.join(this.configPath, `${configName}.js`);
            const config = require(filePath);
            this.configs[configName] = config;

            return config;
        } catch (error) {
            console.error(`Erro ao carregar configuração ${configName}:`, error);
            throw new Error(`Configuração ${configName} não encontrada`);
        }
    }

    async getWebhookConfig(softwareHouseId, cedenteId) {
        try {
            // Carrega configurações do webhook baseado no cedente e softwarehouse
            const webhookConfig = {
                retryAttempts: process.env.WEBHOOK_RETRY_ATTEMPTS || 3,
                retryDelay: process.env.WEBHOOK_RETRY_DELAY || 1000,
                timeout: process.env.WEBHOOK_TIMEOUT || 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': '1.0'
                }
            };

            return webhookConfig;
        } catch (error) {
            console.error('Erro ao obter configuração de webhook:', error);
            throw error;
        }
    }

    async getValidationRules(entityName) {
        try {
            const validatorPath = path.join(this.configPath, 'validators', `${entityName}Validator.js`);
            const validator = require(validatorPath);
            return validator;
        } catch (error) {
            console.error(`Erro ao carregar regras de validação para ${entityName}:`, error);
            throw new Error(`Regras de validação para ${entityName} não encontradas`);
        }
    }

    async getDatabaseConfig() {
        return this.loadConfig('config');
    }

    async getProtocoloConfig() {
        return {
            format: process.env.PROTOCOLO_FORMAT || 'YYYYMMDD-HHmmss-XXXXX',
            prefix: process.env.PROTOCOLO_PREFIX || '',
            suffix: process.env.PROTOCOLO_SUFFIX || ''
        };
    }

    async getReenviarConfig() {
        return {
            maxAttempts: process.env.REENVIAR_MAX_ATTEMPTS || 5,
            delayBetweenAttempts: process.env.REENVIAR_DELAY || 60000, // 1 minuto
            timeLimit: process.env.REENVIAR_TIME_LIMIT || 86400000 // 24 horas
        };
    }

    // Método para validar configurações carregadas
    async validateConfigs() {
        const requiredEnvVars = [
            'WEBHOOK_RETRY_ATTEMPTS',
            'WEBHOOK_RETRY_DELAY',
            'WEBHOOK_TIMEOUT'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.warn('Variáveis de ambiente ausentes:', missingVars);
            console.warn('Usando valores padrão para as configurações ausentes');
        }
    }
}

const configService = new ConfigService();
module.exports = configService;