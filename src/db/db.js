const Sequelize = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  dialect: config.db.dialect,
  pool: config.db.pool,
});

function init() {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });
}
init();

module.exports = sequelize;
