
require('dotenv').config(); // precisa de dotenv instalado

const parseUrl = (url) => {
  // Se você usa URL (postgres://...), o sequelize aceita use_env_variable, 
  // mas aqui deixamos em forma de objeto
  return {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgre',
    database: process.env.DB_NAME || 'webh',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    dialect: 'postgres',
  };
};

module.exports = {
  development: parseUrl(process.env.DB_URL),
  test: parseUrl(process.env.DB_URL_TEST || process.env.DB_URL),
  production: {
    use_env_variable: 'DB_URL' 
  }
};
