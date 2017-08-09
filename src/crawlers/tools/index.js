const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Url = require('url');
const iconv = require('iconv-lite');
const fs = require('fs');
const debug = require('debug')('CrawlerTools');
const lxfs = require('../../utils/lxfs');

const URL = Url.URL;
const Tools = {};

function handleError(err) {
  console.log(`error status is ${err.statusCode}`);
  // console.log(`error message is ${err.message}`);
  // const response = err.response;
  return '';
}


/**
 * parse a string to URL object
 * 
 * @param {any} href string or URL Object
 * @returns URL Object
 */
function URLfyHref(href) {
  let url2format = href;
  let rtn;
  if ((typeof href === 'object')) {
    if (href.href === 'undefined') {
      rtn = null;
    }
    url2format = href.href;
  }
  let url;
  try {
    // url = Url.parse(url2format);
    url = new URL(url2format);
    if (url.protocol === null) {
      rtn = null;
    } else {
      rtn = url;
    }
  } catch (error) {
    rtn = null;
  }
  return rtn;
}
Tools.URLfyHref = URLfyHref;

/**
 * Format the input url string or Url Object.
 * 
 * @param {any} href 
 * @returns formatted url string
 */
function formatHref(href) {
  const url = URLfyHref(href);
  if (url === null) return null;
  const ret = Url.format(url, { fragment: false, unicode: false, auth: false });
  return ret;
}
Tools.formatHref = formatHref;


/**
 * parse the url is or not crossSite,and return the URL resolved url
 * 
 * @param {any} baseurl url which to be extract.
 * @param {any} href url extract form baseurl html
 * @param {boolean} crossSite url extract form baseurl html
 * @return: depends on crossSite,
   if crossSite occurred and crossSite = false then return null,
   else return the URL resolved url.
 */
function parseGotHref(base, href, crossSite = false) {
  // const baseUrl = Url.parse(base);
  const baseUrl = URLfyHref(base);
  const /** t:String */ gotHref = Url.resolve(base, href);
  // const refUrl = Url.parse(gotHref);
  const refUrl = URLfyHref(gotHref);

  if (baseUrl.host !== refUrl.host) {
    if (crossSite === false) {
      return null;
    }
  }
  refUrl.hash = '';
  return refUrl;
}
Tools.parseGotHref = parseGotHref;

/**
 * extract page info  from input url
 * @param url: url to be extract
 * @return: 
    object:{
      urls:urls in the page
    }
 * 
 */
async function extractPageInfos(url, encoding = 'utf8') {
  // encoding = 'binary';
  const options = {
    uri: url,
    encoding: null,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36',
    },
    transform(body, response, resolveWithFullResponse) {
      // let ret = body;
      // if (encoding !== null) {
      //   ret = iconv.decode(body, 'GBK');
      // }
      return iconv.decode(body, encoding);
    },
  };
  const content = await rp(options).catch(handleError);
  const $ = cheerio.load(content);
  const baseurl = Url.parse(url);
  // console.log(baseurl);

  const rtnobj = {};
  const urls = [];
  $('a').each((index, element) => {
    const text = $(element).text();
    const href = $(element).attr('href');
    console.log(`${text} : ${href}`);
    if (typeof href !== 'undefined') {
      const gotHref = parseGotHref(baseurl, href);
      if (gotHref) {
        urls.push({ text, href: gotHref.href });
      }
    }
  });
  rtnobj.urls = urls;
  return rtnobj;
}
Tools.extractPageInfos = extractPageInfos;

/**
 * extract all hrefs from input url
 * @param url: url to be extract
 * @return: none
 * 
 */
async function extractPageUrls(url, encoding = 'utf8') {
  const obj = await extractPageInfos(url, encoding);
  return obj.urls;
}
Tools.extractPageUrls = extractPageUrls;


/**
 * Append url To File After Url is Grabed.
 * At the end of the json string, a '\n' added.
 * 
 * @param {any} saveObj {text:text ,url:url}
 * @param {any} filepath 
 */
function saveUrl(saveObj, filepath) {
  fs.appendFile(filepath, `${JSON.stringify(saveObj)}\n`, 'utf8', (e) => { if (e) throw e; });
}
Tools.saveUrl = saveUrl;

/**
 * Asynchronously read the content
 * 
 * @param {any} filepath 
 * @param {any} cb  callback to parse the data
 */
function loadUrls(filepath, cb) {
  debug(`Load file:${filepath}`);
  const filexists = fs.existsSync(filepath);
  if (filexists) {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) throw err;
      cb(data);
    });
  } else {
    lxfs.createFile(filepath);
  }
  // fs.appendFile(filepath, `${url}\n`, (e) => { if (e) throw e; });
}
Tools.loadUrls = loadUrls;

module.exports = Tools;
