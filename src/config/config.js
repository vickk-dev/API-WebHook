
require('dotenv').config();

const parseUrl = (url) => {
  if (!url) {
    return {
      username: 'postgres',
      password: 'postgre',
      database: 'webh',
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
    };
  }

  // Parse postgres://username:password@host:port/database
  const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  
  if (match) {
    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4], 10),
      database: match[5],
      dialect: 'postgres',
    };
  }

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
