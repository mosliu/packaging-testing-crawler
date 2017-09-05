/**
 * Created by Moses on 2017/8/7.
 */
const dir = require('./dirs.conf');
const path = require('path');
const CONSTS = require('../CONSTS');

const crawlerDbRootPath = '/logs';
const systester = {
  urlSeed: [
    'http://systester.com', 'http://systester.com/News.asp',
    'http://systester.com/Products.asp', 'http://systester.com/Support.asp',
  ],
  name: 'systester',
  websiteflag: CONSTS.WEBSITEFLAG.SYSTESTER,
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const gbtest = {
  // for gbtest ,the product seed is too much,so set in analyzer.
  urlSeed: ['http://www.gbtest.cn/zh-CN/index.html', 'http://www.gbtest.cn/zh-CN/news001.html'],
  name: 'gbtest',
  websiteflag: CONSTS.WEBSITEFLAG.GBTEST,
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
  websiteflag: CONSTS.WEBSITEFLAG.SUMSPRING,
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
  websiteflag: CONSTS.WEBSITEFLAG.SUMSPRING,
  pageencode: 'gb2312',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const mocon = {
  urlSeed: [
    'http://www.mocon.com/index.html',
    // 'http://www.mocon.com/about-mocon/brands-and-capabilities/permeation.html',
  ],
  name: 'mocon',
  websiteflag: CONSTS.WEBSITEFLAG.MOCON,
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};
const labstone = {
  urlSeed: [
    'http://www.labstone.cn/',
    'http://en.labstone.cn/products/FrontColumns_navigation01-1487904483630FirstColumnId=2.html',
  ],
  name: 'labstone',
  websiteflag: CONSTS.WEBSITEFLAG.LABSTONE,
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};
const drick = {
  urlSeed: [
    'http://www.drick.cn/',
    'http://www.drick.cn/en/Product.aspx',
  ],
  name: 'drick',
  websiteflag: CONSTS.WEBSITEFLAG.DRICK,
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};
const cscii = {
  urlSeed: [
    'http://cscii.com/',
  ],
  name: 'cscii',
  websiteflag: CONSTS.WEBSITEFLAG.CSCII,
  pageencode: 'utf8',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const conf = {
  systester,
  gbtest,
  sumspring,
  sumspringEn,
  mocon,
  labstone,
  drick,
  cscii,
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
