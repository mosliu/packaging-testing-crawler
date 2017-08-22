/**
 * Created by Moses on 2017/7/7.
 */
const cronCrawler = require('./cron_crawlers');
const cronAnalyzer = require('./cron_analyzers');


const start = function () {
  // const clawlers = cronCrawler();
  cronCrawler();
  // const analyzers = cronAnalyzer();
  cronAnalyzer();
};
module.exports = {
  start,
};
