const queryString = require('query-string');
const url = require('url');

const href = url.parse('http://www.gbtest.cn/zh-CN/products002.html?fid=29383&fname=%E7%94%B5%E5%AD%90&typeid2=30571');
const parsed = queryString.parse(href.query);
console.log(parsed);
