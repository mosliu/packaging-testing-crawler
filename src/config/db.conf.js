const dbConf = {
  database: 'crawlers',
  username: 'crawlers',
  password: '123456',
  host: 'localhost',
  // host: '192.168.7.202',
  port: 3306,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 25,
    min: 0,
    idle: 40000,
    maxIdleTime: 120000,
    acquire: 30000,
    evict: 60000,
    handleDisconnects: true,
  },
};

module.exports = dbConf;
