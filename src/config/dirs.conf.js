/**
 * Created by Moses on 2017/8/4.
 */
const path = require('path');

// __dirname : ***\src\config
// path.dirname(p)  返回路径的所在的文件夹名称
// srcRoot: ***\src
const srcRoot = path.dirname(__dirname);
const rootDir = path.resolve(srcRoot, '../');
const confDir = path.join(srcRoot, 'config');
const logsDir = path.join(rootDir, 'logs');
// koa server使用的 ***\src\server
const viewsRoot = path.join(srcRoot, 'views');
const staticDir = path.join(viewsRoot, 'assets');

const resourceDir = path.join(viewsRoot, 'public');
const uploadDir = path.join(resourceDir, 'upload');

const dirConf = {
  root: rootDir,
  log: logsDir,
  src: srcRoot,
  config: confDir,
  static: staticDir,
  server: viewsRoot,
  resource: resourceDir,
  upload: uploadDir,
};

module.exports = dirConf;
