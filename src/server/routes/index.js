/**
 * Created by Moses on 2017/7/10.
 */

const router = require('koa-router')();
const main = require('./main');
const users = require('./users');
const info = require('./info');

router.use('', main.routes(), main.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());
router.use('/info', info.routes(), users.allowedMethods());

module.exports = router;
