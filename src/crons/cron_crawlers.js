const config = require('../config');
const CronJob = require('cron').CronJob;
const crawlers = require

const cronconf = config.cron;

async function 
async function getHosts() {
  console.log(`Fetch hosts ,time:${new Date()}`);
  const values = await hosts();
  const count = Object.getOwnPropertyNames(values).length;
  console.log(`get ${count} hosts data`);
  if (count > 100) {
    cache.put('hosts', values);
  }
  console.log('================');
}


function startCrawl() {
  // '0 * * * *'
  return new CronJob(cronconf.crontab, (async () => {
    await getHosts();
  }), null, true, 'Asia/Chongqing');
}
module.exports = startCrawl;
