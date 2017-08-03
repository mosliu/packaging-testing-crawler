const Tools = require('../tools');
const URL = require('url');
// urlDict;
// while (urlToProcess) { Tools.extractPageUrls('http://systester.com'); }

const urlToProcess = [];
const urlDict = {};

// URL.parse('http://systester.com').href;

async function start() {
  // const urls = await Tools.extractPageUrls('http://www.gbtest.cn/zh-CN/index.html');
  // const urls = await Tools.extractPageUrls('http://192.168.7.202');
  while (urlToProcess.length > 0) {
    const nexturl = urlToProcess.pop();
    console.log(`====processing:${nexturl}`);
    if (nexturl.endsWith('pdf')) {
      console.log('pdf!!1');
    }
    const urls = await Tools.extractPageUrls(nexturl, 'gb2312');
    urls.forEach((element) => {
      putNextUrl(element);
    }, this);
  }
  // for (const url of urls) {
  //   console.log(url);
  // }
}

function putNextUrl(obj) {
  const text = obj.text;
  const url = obj.href;
  const url2add = Tools.formatHref(url);
  if (url2add === null) {
    console.log(`Wrong url:${url}`);
  }
  if (!urlDict[url2add]) {
    urlDict[url2add] = true;
    urlToProcess.push(url2add);
    console.log(`url:${url2add} pushed into urlToProcess`);
  }
}

urlToProcess.push('http://systester.com');
start();
