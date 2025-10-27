const Redis = require('ioredis');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class CacheService {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redis.on('error', (err) => {
            console.error('Erro na conexão com Redis:', err);
        });

        this.redis.on('connect', () => {
            console.log('Conectado ao Redis com sucesso');
        });
    }

    _hashPayload(payload) {
        const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return crypto.createHash('sha256').update(str).digest('hex');
    }

    async createUuidForPayload(payload, ttlSeconds = 3600) {
        const hash = this._hashPayload(payload);
        const key = `payload_lock:${hash}`;

        const uuid = uuidv4();

        const setResult = await this.redis.set(key, uuid, 'EX', ttlSeconds, 'NX');

        if (setResult === 'OK') {
            return { created: true, uuid };
        }

        const existingUuid = await this.redis.get(key);
        return { created: false, uuid: existingUuid };
    }

    async isDuplicatePayload(payload) {
        const hash = this._hashPayload(payload);
        const key = `payload_lock:${hash}`;
        const exists = await this.redis.exists(key);
        return exists === 1;
    }

    /**
     * Armazena dados em cache com TTL
     * @param {string} key - Chave do cache
     * @param {any} value - Valor a ser armazenado
     * @param {number} ttlSeconds - Tempo de vida em segundos
     */
    async set(key, value, ttlSeconds) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await this.redis.set(key, stringValue, 'EX', ttlSeconds);
    }

    /**
     * Recupera dados do cache
     * @param {string} key - Chave do cache
     * @returns {any} Valor armazenado ou null
     */
    async get(key) {
        const value = await this.redis.get(key);
        if (!value) return null;
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    /**
     * Verifica se uma chave existe no cache
     * @param {string} key - Chave do cache
     * @returns {boolean}
     */
    async exists(key) {
        const exists = await this.redis.exists(key);
        return exists === 1;
    }

    /**
     * Remove uma chave do cache
     * @param {string} key - Chave do cache
     */
    async delete(key) {
        await this.redis.del(key);
    }
}

module.exports = new CacheService();