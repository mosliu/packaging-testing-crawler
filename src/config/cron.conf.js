const cronConf = {
  // 每小时
  crontab: '0 * * * *',

  database: 'crawlers',
  username: 'crawlers',
  password: '123456',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 30000,
  },
};

module.exports = cronConf;
