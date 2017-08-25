/**
 * Created by Moses on 2017/8/7.
 */
const dir = require('./dirs.conf');
const path = require('path');

const crawlerDbRootPath = '/logs';
const systester = {
  urlSeed: [
    'http://systester.com', 'http://systester.com/News.asp',
    'http://systester.com/Products.asp', 'http://systester.com/Support.asp',
  ],
  name: 'systester',
  websiteflag: 'systester.com',
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const gbtest = {
  // for gbtest ,the product seed is too much,so set in analyzer.
  urlSeed: ['http://www.gbtest.cn/zh-CN/index.html', 'http://www.gbtest.cn/zh-CN/news001.html'],
  name: 'gbtest',
  websiteflag: 'gbtest.cn',
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const sumspring = {
  urlSeed: [
    'http://www.sumspring.com/', 'http://www.sumspring.com/News/',
    'http://www.sumspring.com/gsxw/', 'http://www.sumspring.com/hyzx/',
    'http://www.sumspring.com/ybcjcyq/', 'http://www.sumspring.com/slbzjcyq/',
    'http://www.sumspring.com/zbzysjcyq/', 'http://www.sumspring.com/jnjjcyq/',
    'http://www.sumspring.com/khal/', 'http://www.sumspring.com/jzfa/',
  ],
  name: 'sumspring',
  websiteflag: 'sumspring.com',
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const sumspringEn = {
  urlSeed: [
    'http://www.sumspring.cn/',
    'http://www.sumspring.cn/Industry/', 'http://www.sumspring.cn/dynamics/',
    'http://www.sumspring.cn/knowledge/', 'http://www.sumspring.cn/services/',
    'http://www.sumspring.cn/CN/', 'http://www.sumspring.cn/zzpbzjcyq/',
    'http://www.sumspring.cn/ypbzjcyq/', 'http://www.sumspring.cn/Glass%20bottle%20test%20machine/',
    'http://www.sumspring.cn/jnzpjcyq/', 'http://www.sumspring.cn/slbzjcyq/',
  ],
  name: 'sumspringEn',
  websiteflag: 'sumspring.com',
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const mocon = {
  urlSeed: [
    'http://www.mocon.com/index.html',
  ],
  name: 'mocon',
  websiteflag: 'mocon.com',
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const conf = {
  // systester,
  // gbtest,
  // sumspring,
  // sumspringEn,
  mocon,
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
