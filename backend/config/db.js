const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Synchronisiere die Datenbank
    await User.sync({ force: true });
    await Collection.sync({ force: true });
    await Item.sync({ force: true });
    
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
