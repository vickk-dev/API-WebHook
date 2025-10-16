const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  db: {
    url: process.env.DB_URL || null,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
};