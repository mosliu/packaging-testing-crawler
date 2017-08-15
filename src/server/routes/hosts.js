/**
 * Created by Moses on 2017/7/10.
 */
const router = require('koa-router')();
const cache = require('memory-cache');

router.get('/', async (ctx, next) => {
  const hostsList = cache.get('hosts');
  let retString = '';
  if (hostsList !== null) {
    let maxStr;
    const array = Object.entries(hostsList).map(e => ` ${e[1]} ${e[0]}`);

    retString = `# auto generate \n${array.join('\n')}`;
  }
  ctx.body = retString;
});

module.exports = router;

