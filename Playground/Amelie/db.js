const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load .env file from a specific path
dotenv.config({ path: './backend/config/.env' });

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: console.log,
});

module.exports = db;

//