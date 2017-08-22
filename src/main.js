// process.env.debug = '*, -send';
process.env.NODE_ENV = 'development';

const server = require('./server');
// const crons = require('./crons');

server.init();
// crons.start();

