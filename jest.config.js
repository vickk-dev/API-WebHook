module.exports = {
  testEnvironment: 'node',
  maxWorkers: 1, // Roda testes em sequência (1 worker por vez)
  testTimeout: 30000, // Timeout de 30 segundos
  verbose: true
};
