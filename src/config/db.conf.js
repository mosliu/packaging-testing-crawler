const dbConf = {
  database: 'crawlers',
  username: 'crawlers',
  password: '123456',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 30000,
  },
};

module.exports = dbConf;
