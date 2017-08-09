/**
 * Created by Moses on 2017/8/7.
 */
const dir = require('./dirs.conf');
const path = require('path');

const crawlerDbRootPath = '/logs';
const systester = {
  urlSeed: ['http://systester.com'],
  name: 'systester',
  dictfilepath: '',
  listpath: '',
  dbpath: '',
};

const conf = {
  systester,
};


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
  }
}
console.dir(conf);
module.exports = conf;
