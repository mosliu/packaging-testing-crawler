const crawler = {
  // 每小时
  crontab: '0 40 * * * *',
};
const analyzer = {
  // 每小时
  crontab: '0 */5 * * * *',
};
const cronConf = {
  crawler,
  analyzer,
};

module.exports = cronConf;
