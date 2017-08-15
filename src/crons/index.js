/**
 * Created by Moses on 2017/7/7.
 */
const cronCrawler = require('./cron_crawlers');

const clawlers = cronCrawler();

module.exports = {
  clawlers,
};
