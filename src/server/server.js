/**
 * Created by lx031 on 2017/7/6.
 */
const config = require('../config');
const Koa = require('koa');
const onerror = require('koa-onerror');

const views = require('koa-views');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const logUtil = require('../utils/log_utils');

const users = require('./routes/users');
const index = require('./routes/index');
// x-response-time


const app = new Koa();
// error handler
onerror(app);

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
  onerror(err, ctx) {
    ctx.throw('body parse error', 422);
  },
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(`${__dirname}/public`));

app.use(views(`${__dirname}/views`, {
  extension: 'pug',
}));

// logger
app.use(async (ctx, next) => {
  // 响应开始时间
  const start = new Date();
  // 响应间隔时间
  let ms;
  try {
    // 开始进入到下一个中间件
    await next();
    ms = new Date() - start;
    // 记录响应日志
    logUtil.logResponse(ctx, ms);
  } catch (error) {
    ms = new Date() - start;
    // 记录异常日志
    logUtil.logError(ctx, error, ms);
  }
  ctx.set('X-Response-Time', `${ms}ms`);
});


// routes
//
// app.use(users.routes(), users.allowedMethods());
app.use(index.routes(), index.allowedMethods());

module.exports = app;

