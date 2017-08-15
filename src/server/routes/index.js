/**
 * Created by Moses on 2017/7/10.
 */

const router = require('koa-router')();
const main = require('./main');
const users = require('./users');
const hosts = require('./hosts');

router.use('', main.routes(), main.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());
router.use('/hosts', hosts.routes(), hosts.allowedMethods());

module.exports = router;

