/**
 * Created by Moses on 2017/8/15.
 */
const path = require('path');
const dirs = require('./dirs.conf');

const logConf = {
  appenders: {
    // 错误日志
    file: {
      type: 'file',
      filename: path.join(dirs.log, 'common.log'),
      maxLogSize: 10 * 1024 * 1024, // = 10Mb
      numBackups: 5, // keep five backup files
      compress: true, // compress the backups
      encoding: 'utf-8',
      mode: 0o0640,
      flags: 'a+',
    },
    errorfile: {
      // category: 'errorLogger', // logger名称
      type: 'dateFile', // 日志类型
      filename: path.join(dirs.log, 'error'), // 日志输出位置
      alwaysIncludePattern: true, // 是否总是有后缀名
      pattern: '-yyyy-MM-dd.log', // 后缀，每天创建一个新的日志文件
    },
    out: {
      // type: 'console',
      type: 'stdout',
    }
    ,
  },
  categories: {
    default: { appenders: ['out', 'file'], level: 'trace' },
    error: { appenders: ['out', 'errorfile'], level: 'warn' },
  },
  // replaceConsole: true,
  // levels: {// 设置logger名称对应的的日志等级
  //   // trace debug info warn error fatal
  //   errorLogger: 'ERROR',
  //   // resLogger: 'ALL',
  // }
  // ,
}
;

module.exports = logConf;
