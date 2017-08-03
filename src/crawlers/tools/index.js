const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Url = require('url');
const iconv = require('iconv-lite');

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
 * extract all hrefs from input url
 * @param url: url to be extract
 * @return: none
 * 
 */
async function extractPageUrls(url, encoding = 'utf8') {
  // encoding = 'binary';
  const options = {
    uri: url,
    encoding: null,
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

  const rtn = [];

  $('a').each((index, element) => {
    const text = $(element).text();
    const href = $(element).attr('href');
    console.log(`${text} : ${href}`);
    if (typeof href !== 'undefined') {
      // console.log(href);
      // console.log(index);
      // const gotHref = URL.resolve(baseurl, href);
      const gotHref = parseGotHref(baseurl, href);
      if (gotHref) {
        rtn.push({ text, href: gotHref.href });
      }
      // console.log(gotHref);
      // console.log('========================');
    }
  });
  return rtn;
  // console.dir(urlDict);
  // console.dir(urlToProcess);
  // console.log(content);
}
Tools.extractPageUrls = extractPageUrls;

// URL.parse('http://systester.com').href;
// urlDict;
// while (urlToProcess) { Tools.extractPageUrls('http://systester.com'); }


module.exports = Tools;
