const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Laden der Umgebungsvariablen
dotenv.config({ path: './backend/config/.env' });

const db = new Sequelize(process.env.SUPABASE_DB_NAME, process.env.SUPABASE_DB_USER, process.env.SUPABASE_DB_PASSWORD, {
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
});

module.exports = db;
