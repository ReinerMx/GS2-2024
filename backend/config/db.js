const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './.env' });

// Use environment variables for database connection
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  logging: false, // Optional: Disable logging for cleaner output
  retry: {
    max: 10, // Maximum number of retries
    match: [
      /ECONNREFUSED/, // Retry on connection refused
      /ETIMEDOUT/,    // Retry on timeout
    ],
  },
  pool: {
    max: 5, // Maximum number of connections
    min: 0, // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to acquire a connection
    idle: 10000,    // Maximum time (ms) a connection can be idle
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
