const pr = require('request-promise-native');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const outStream = fs.WriteStream('urls.txt');

/* 去重字典 */
const urlDic = {};
const urlList = [];


/* 精心挑选的种子URL——如何精心是个问题 */
const originalURL = [
  'http://systester.com',
];

/* 传入一个可能带有参数字符串的链接，返回一个无参数的链接 */
const Tools = {};
function getUrl(href) {
  if (typeof c === 'undefined') {
    return '';
  }
  const index = href.indexOf('?');
  let url = href;
  if (index > -1) {
    url = href.substring(0, index);
  }
  return url;
}
Tools.getUrl = getUrl;

Tools.getNumbersOfUrl = function (href) {
  const pattern = /\d+/;
  const numbers = pattern.exec(href);
  return numbers;
};

const grabAllURLs = async function (url) {
  pr.get;
};

/**
 * 根据传入的url，获取该页面，并提取该页面中的类似URL地址并去重
 * 
 * @param {any} url 
 */
function fetchNextURLs(url) {
  request({ url }, (error, response, body) => {
    if (error) {
      return console.error(error);
    }
    console.log(`成功爬取到页面： ${url}`);
    const $ = cheerio.load(response.body.toString());
    /* 保存当前页面 */
    const numbers = Tools.getNumbersOfUrl(url);
    // const htmlStream = fs.WriteStream(`./douban_movies_html/movie${numbers}.html`);
    // htmlStream.write(body);
    // htmlStream.end();
    /* 获取当前页面包含的所有URL，去重后放入hrefs列表 */
    const hrefs = [];
    // console.log($('body').attr('href'));

    $('a').each(function () {
      const $me = $(this);
      // console.log(`Parsing ${$me}`);
      const thishref = $me.attr('href');
      console.log(thishref);
      const href = Tools.getUrl(thishref);
      const numbers = Tools.getNumbersOfUrl(href);
      if (!urlDic[numbers]) {
        urlDic[numbers] = true;
        hrefs.push(href);
        outStream.write(`${href}\r\n`);
      }
    });
    /* hrefs的长度为0，表明无法继续查找新的链接了，因此停止爬虫程序 */
    if (hrefs.length === 0) {
      console.log('本页面未能爬取到新链接。');
    } else {
      urlList.concat(hrefs);
      /* 如果没有超过预定值，则继续进行请求 */
      if (urlList.length < 100) {
        for (let i = 0; i < hrefs.length; i += 1) {
          fetchNextURLs(hrefs[i]);
        }
      } else {
        outStream.end();
        console.log('超过预订的数目，爬虫程序正常结束。获取到的总链接数为：', urlList.length);
      }
    }
  });
}


/* 根据种子URL启动爬虫 */
for (let i = 0; i < originalURL.length; i++) {
  fetchNextURLs(originalURL[i]);
}


// urls.push('http://systester.com');
// console.log(urls);

