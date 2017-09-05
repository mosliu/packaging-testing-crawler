const systester = require('./systester');
const gbtest = require('./gbtest');
const sumspring = require('./sumspring');
const mocon = require('./mocon');
const drick = require('./drick');
const labstone = require('./labstone');
const cscii = require('./cscii');

async function start() {
  // await analyzer_systester.run();
  await Promise.all(
    [
      systester.run(),
      gbtest.run(),
      sumspring.run(),
      mocon.run(),
      drick.run(),
      labstone.run(),
      cscii.run(),
    ],
  );
}


module.exports = { start };


// start();
