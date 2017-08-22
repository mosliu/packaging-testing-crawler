const config = require('../config');
const CronJob = require('cron').CronJob;
const debug = require('debug')('Cron:analyzer');
const analyzers = require('../analyzers');

const cronconf = config.cron.analyzer;

async function startAnalyzer() {
  debug('Analyzer Cron triggered ,Analyzer Start');
  await analyzers.start();
}


function startAnalyze() {
  // '0 * * * *'
  return new CronJob(cronconf.crontab, (async () => {
    await startAnalyzer();
  }), null, true, 'Asia/Chongqing');
}
module.exports = startAnalyze;
// startAnalyze();
