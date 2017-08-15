const server = require('./server');
const debug = require('debug')('moses:server');
const http = require('http');
const config = require('../config');


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


/**
 * Get port from environment and store in Express.
 */

// const port = normalizePort(process.env.PORT || '3000');
const port = normalizePort(config.app.port || '3000');

/**
 * Create HTTP server.
 */

const httpserver = http.createServer(server.callback());


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = httpserver.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

function init() {
  httpserver.listen(port);
  httpserver.on('error', onError);
  httpserver.on('listening', onListening);
}
init();

module.exports = { init };
