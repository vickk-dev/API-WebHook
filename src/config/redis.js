const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Só exibe logs e listeners se **não** estiver rodando em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

// Exporta o client para uso no app e fechamento nos testes
module.exports = redisClient;