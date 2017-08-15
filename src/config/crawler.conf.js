/**
 * Created by Moses on 2017/8/7.
 */
const dir = require('./dirs.conf');
const path = require('path');

const crawlerDbRootPath = '/logs';
const systester = {
  urlSeed: ['http://systester.com'],
  name: 'systester',
  websiteflag: 'systester.com',
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const gbtest = {
  urlSeed: ['http://www.gbtest.cn/zh-CN/index.html'],
  name: 'gbtest',
  websiteflag: 'gbtest.cn',
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const sumspring = {
  urlSeed: ['http://www.sumspring.com/'],
  name: 'sumspring',
  websiteflag: 'sumspring.com',
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const conf = {
  systester, gbtest, sumspring,
};

const confArray = [];
for (const obj of Object.values(conf)) {
  if (obj.name) {
    if (!obj.filepath) {
      obj.filepath = path.join(dir.root, crawlerDbRootPath, `${obj.name}.urldict.txt`);
    }

    if (!obj.listpath) {
      obj.listpath = path.join(dir.root, crawlerDbRootPath, `${obj.name}.list.txt`);
    }

    if (!obj.dbpath) {
      obj.dbpath = path.join(dir.root, crawlerDbRootPath, `${obj.name}.db`);
    }
    confArray.push(obj);
  }
}

conf.confArray = confArray;
// console.dir(conf);
module.exports = conf;
