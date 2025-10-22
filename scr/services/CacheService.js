const Redis = require('ioredis');

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