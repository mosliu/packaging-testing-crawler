const systester = require('./systester');
const gbtest = require('./gbtest');
const sumspring = require('./sumspring');


async function start() {
  // await analyzer_systester.run();
  await Promise.all(
    [
      systester.run(),
      gbtest.run(),
      sumspring.run(),
    ],
  );
}


module.exports = { start };


// start();
