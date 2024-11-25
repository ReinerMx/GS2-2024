const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gs2_database', 'postgres', 'mysecretpassword', {
  host: 'pgstac',
  dialect: 'postgres',
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
