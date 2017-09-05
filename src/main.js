process.env.debug = '*,-sequelize:*,-retry-as-promised,-log4js*,-koa-router,-streamroller:*,-koa-views';
process.env.NODE_ENV = 'development';

const server = require('./server');
const crons = require('./crons');

server.init();
crons.start();

