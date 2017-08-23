/**
 * Created by Moses on 2017/8/15.
 */
const log4js = require('log4js');
const config = require('../config');

// 加载配置文件
log4js.configure(config.log);

const logUtil = {};

const errorLogger = log4js.getLogger('errorLogger');
const resLogger = log4js.getLogger('resLogger');


// 格式化请求日志
function formatReqLog(req, resTime) {
  let logText = '';
  // const newline = '\n';
  const method = req.method;
  // 客户端ip 访问方法 请求原始地址 服务器响应时间
  logText += `request ${req.ip} ${method} : ${req.originalUrl}    - ${resTime} ms\n`;
  // 请求参数
  if (method === 'GET') {
    logText += `request query:  ${JSON.stringify(req.query)}\n`;
    // startTime = req.query.requestStartTime;
  } else {
    logText += `request body:\n${JSON.stringify(req.body)}\n`;
    // startTime = req.body.requestStartTime;
  }
  return logText;
}


// 格式化响应日志
const formatRes = function (ctx, resTime) {
  let logText = '\n';

  // 响应日志开始
  logText += '*************** response log start ***************\n';

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime);

  // 响应状态码
  logText += `response status: ${ctx.status}\n`;

  // 响应内容
  if (config.debug === true) {
    logText += `response body: \n ${JSON.stringify(ctx.body)}\n`;
  }

  // 响应日志结束
  // logText += '*************** response log end *************** \n';

  return logText;
};

// 格式化错误日志
function formatError(ctx, err, resTime) {
  let logText = '\n';

  // 错误信息开始
  logText += '*************** error log start ***************\n';

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime);

  // 错误名称
  logText += `err name: ${err.name}\n`;
  // 错误信息
  logText += `err message: ${err.message}\n`;
  // 错误详情
  logText += `err stack: ${err.stack}\n`;

  // 错误信息结束
  // logText += '*************** error log end ***************\n';

  return logText;
}


// 封装错误日志
logUtil.logError = function (ctx, error, resTime) {
  if (ctx && error) {
    errorLogger.error(formatError(ctx, error, resTime));
  }
};

// 封装响应日志
logUtil.logResponse = function (ctx, resTime) {
  if (ctx) {
    resLogger.info(formatRes(ctx, resTime));
  }
};
module.exports = logUtil;
