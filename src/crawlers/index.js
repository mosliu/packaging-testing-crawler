const Crawler = require('./Crawler');
const config = require('../config');

const confArray = config.crawler.confArray;

// const systester = new Crawler(config.crawler.systester);
// const gbtest = new Crawler(config.crawler.gbtest);
// const sumspring = new Crawler(config.crawler.sumspring);
const crawlerArray = confArray.map(conf => new Crawler(conf));

// sleep in Promise
function sleep(ms) {
  return (
    new Promise(((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    }))
  );
}

async function start() {
  await sleep(2000);
  await Promise.all(crawlerArray.map(e => e.start()));
}

module.exports = { start };
