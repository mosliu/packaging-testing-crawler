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
  debug(`Error Occurd :  ${err}`);
  // console.log(`error message is ${err.message}`);
  // const response = err.response;
  return '';
}


/**
 * parse a string to URL object
 * 
 * @param {any} href string or URL Object
 * @returns  URL Object
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
  if (href.indexOf('://') > 0) {
    // do nothing
  } else if (href.toLowerCase().startsWith('tel:')) {
    href = '';
  } else if (href.toLowerCase().startsWith('mailto:')) {
    href = '';
  } else if (href.startsWith('/')) {
    // do nothing
  } else {
    href = `/${href}`;
  }

  const /** t:String */ gotHref = Url.resolve(base, href);
  // const refUrl = Url.parse(gotHref);
  const refUrl = URLfyHref(gotHref);
  if (crossSite === false) {
    let sameSiteFlag = false;
    if (baseUrl.host === refUrl.host) {
      sameSiteFlag = sameSiteFlag || true;
    }
    const subBaseurl = baseUrl.host.substr(baseUrl.host.indexOf('.'));
    const subRefUrl = refUrl.host.substr(refUrl.host.indexOf('.'));
    // www.baidu.com/1  to www.baidu.com/2
    if (baseUrl.host === refUrl.host) {
      sameSiteFlag = sameSiteFlag || true;
    }
    // www.baidu.com/1  to baidu.com/3
    if (subBaseurl === refUrl.host) {
      sameSiteFlag = sameSiteFlag || true;
    }
    // www.baidu.com/1  to aa.www.baidu.com/4
    if (baseUrl.host === subRefUrl) {
      sameSiteFlag = sameSiteFlag || true;
    }
    // www.baidu.com/1  to aa.baidu.com/4
    if (subBaseurl === subRefUrl) {
      sameSiteFlag = sameSiteFlag || true;
    }
    if (sameSiteFlag === false) {
      return null;
    }
  }
  refUrl.hash = '';
  // debug(refUrl);
  return refUrl;
}
Tools.parseGotHref = parseGotHref;

/**
 * extract page info  from input url
 * @param url: url to be extract
 * @return: 
    object:{
      urls:urls in the page,
      body: whole content,
      refurl: url who got this object
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


  const urls = [];
  $('a').each((index, element) => {
    const text = $(element).text();
    const href = $(element).attr('href');
    // console.log(`${text} : ${href}`);

    if (typeof href !== 'undefined') {
      const gotHref = parseGotHref(baseurl, href);
      if (gotHref) {
        urls.push({ text, href: gotHref.href });
      }
    }
  });


  // the return object,contains urls and content and fetchUrl 
  const rtnobj = {};
  rtnobj.urls = urls;
  rtnobj.body = content;
  rtnobj.refurl = url;
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


/**
 * Judge a url is or not a Document file.return false if it is a webpage.
 * 
 * @param {any} href 
 * @param {any} this.siteconfig.websiteflag indict the website 
 * @returns 
 */
function judgedDocFile(href, websiteflag) {
  const u = Url.parse(href);
  let flag = false;
  const pathname = u.pathname;
  if (websiteflag === '' && 1 === 0) {
    // Fake method, here for which site's path is particular
    flag = true;
  }
  if (pathname.indexOf('.') === -1) {
    // The pathname is not end with any suffix. think it as false
  } else {
    const suffixs = ['pdf', 'jpg', 'gif', 'png', 'mp4', 'mp3', 'wav', 'rm'];
    const suffix = u.pathname.substr(pathname.lastIndexOf('.') + 1);
    if (suffixs.includes(suffix)) {
      flag = true;
    }
  }

  return flag;
}
Tools.judgedDocFile = judgedDocFile;
module.exports = Tools;
