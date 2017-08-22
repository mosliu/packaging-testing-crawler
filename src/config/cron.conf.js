const crawler = {
  // 每小时
  crontab: '0 21  * * * *',
};
const analyzer = {
  // 每小时
  crontab: '0 30 * * * *',
};
const cronConf = {
  crawler,
  analyzer,
};

module.exports = cronConf;
