const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:gbtest');
// const Organizer = require('./organizer');
const Organizer = require('../utils/engine');
const CONSTS = require('../CONSTS');

const app = new Organizer();

async function getNotParsed(website) {
  const rtn = await myDb.findAll({
    where: {
      accessed: true,
      websiteflag: website,
      // isfile: false,
      analyzed: false,
    },
  });
  return rtn;
}

/**
 * this middleware must put at the first 
 * 
 * @param {any} doc 
 * @param {any} next 
 */
async function preAndPostAnalyze(doc, next) {
  const pathname = url.parse(doc.url).pathname;
  // eslint-disable-next-line
  doc.pathname = pathname;
  // eslint-disable-next-line
  doc.needsave = false;
  await next();
  if (doc.needsave) {
    debug(`Modified Doc saved,id:${doc.id}`);
    doc.save();
  }
}

async function processNews(doc, next) {
  // doc.url: http://systester.com/newsShow.asp?id=3637
  // pathname: /newsShow.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if (pathname === '/zh-CN/displaynews.html') {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('.dnews_title').text().trim();
    doc.analyzedbody = $('.dnews_content').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2}/ig;
    const datestr = $('.dnews_line').text().match(datereg);
    if (datestr.length > 0) {
      doc.bodydate = new Date(datestr[0]);
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else if (pathname === '/en/displaynews.html') {
    debug(`Found News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('.dnews_title').text().trim();
    doc.analyzedbody = $('.dnews_content').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2}/ig;
    const datestr = $('.dnews_line').text().match(datereg);
    if (datestr.length > 0) {
      doc.bodydate = new Date(datestr[0]);
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else {
    next();
  }
}

async function processProducts(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if (pathname === '/zh-CN/displayproduct.html') {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('title').text().replace('----氧气透过率测定仪|水汽透过率测定仪|气体透过率测定仪|透气仪|透氧仪|透湿仪|包装检测仪器——广州标际包装设备有限公司', '');
    doc.analyzedbody = $('.dis_tab').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else if ((pathname === '/en/product_Show.asp') || (pathname === '/en/displayproduct.html')) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('title').text().replace('----Oxygen permeability tester|Permeation testing instruments|Water Vapor Transmission Rate|WVTR|OTR|GTR|Laboratory equipment||Pouch spout inserting machine', '');
    doc.analyzedbody = $('.dis_tab').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else {
    next();
  }
}

// 标记的种子页面太多了 使用该方法可以重置所有的种子页面获取状态
async function resetSeedLists(doc, next) {
  const pathname = doc.pathname || url.parse(doc.url).pathname;
  // pathname = pathname.replace(/\/en\//gm, '/');
  // pathname = pathname.replace(/\/zh-CN\//gm, '/');

  const productArray = [
    '/zh-CN/products.html', '/zh-CN/products001.html', '/zh-CN/products002.html',
    '/en/newproducts.html', '/en/products.html',
  ];

  const newsArray = [
    '/zh-CN/news.html', '/zh-CN/news001.html', '/zh-CN/news002.html',
    '/en/news.html',
  ];

  const allArray = newsArray.concat(productArray);

  if (allArray.includes(pathname)) {
    doc.analyzed = false;
    doc.accessed = false;
    doc.needsave = true;
    doc.body = '';
  } else {
    next();
  }
}

async function processMedias(doc, next) {
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if ((pathname === '/zh-CN/displayproduct002.html') || (pathname === '/en/displayproduct002.html')) {
    debug(`Found Medias,id:${doc.id}`);
    // const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'MEDIA';
    doc.bodytitle = doc.title;
    // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else {
    next();
  }
}

// async function processFiles(doc, next) {
//   // doc.url: http://systester.com/product_Show.asp?id=3235
//   // pathname: /product_Show.asp
//   const pathname = doc.pathname || url.parse(doc.url).pathname;

//   if (!pathname.startsWith('/upfiles/')) {
//     next();
//   } else {
//     debug(`Found File,id:${doc.id}`);
//     // const $ = cheerio.load(doc.body);
//     doc.analyzed = true;
//     // TODO  news product need to be cast to constvalue
//     doc.bodytype = 'FILE';
//     doc.bodytitle = doc.title;
//     // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
//     // empty body field save the mysql space
//     doc.body = '';
//     doc.needsave = true;
//   }
// }

// for gbtest support info is same to news
// async function processSupportShow(doc, next) {
//   // doc.url: http://systester.com/product_Show.asp?id=3235
//   // pathname: /product_Show.asp
//   const pathname = doc.pathname || url.parse(doc.url).pathname;

//   if ((pathname !== '/SupportShow.asp') && (pathname !== '/en/SupportShow.asp')) {
//     next();
//   } else {
//     debug(`Found SupportShow,id:${doc.id}`);
//     const $ = cheerio.load(doc.body);
//     doc.analyzed = true;
//     // TODO  news product need to be cast to constvalue
//     doc.bodytype = 'SUPPORTSHOW';
//     doc.bodytitle = $('title').text().replace('-软包装检测仪器_食品药品包装检测设备_SYSTESTER思克-济南思克测试技术有限公司', '');
//     doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
//     const datereg = /\d{4}-\d{2}-\d{2}/ig;
//     const datestr = $('div.centen2 div span').text().match(datereg);
//     if (datestr.length > 0) {
//       doc.bodydate = new Date(datestr[0]);
//     }
//     // empty body field save the mysql space
//     doc.body = '';
//     doc.needsave = true;
//   }
// }

async function processUseless(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  let pathname = doc.pathname || url.parse(doc.url).pathname;
  pathname = pathname.replace(/\/en\//gm, '/');
  pathname = pathname.replace(/\/zh-CN\//gm, '/');
  const uselessArray = ['/feedback.html', '/introduce.html', '/introduce001.html', '/introduce003.html'];
  if (!uselessArray.includes(pathname)) {
    next();
  } else {
    debug(`Found Useless,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'USELESS';
    doc.bodytitle = $('title').text().replace('----氧气透过率测定仪|水汽透过率测定仪|气体透过率测定仪|透气仪|透氧仪|透湿仪|包装检测仪器——广州标际包装设备有限公司', '');
    doc.bodytitle = doc.bodytitle.replace('----Oxygen permeability tester|Permeation testing instruments|Water Vapor Transmission Rate|WVTR|OTR|GTR|Laboratory equipment||Pouch spout inserting machine', '');
    // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.notuseful = true;
    doc.needsave = true;
  }
}

function init() {
// this middleware must put at the first 
  app.use(preAndPostAnalyze);
  app.use(resetSeedLists);
  app.use(processUseless);
  app.use(processMedias);
  // app.use(processFiles);
  // app.use(processSupportShow);
  app.use(processNews);
  app.use(processProducts);
}
async function run() {
  const arrs = await getNotParsed(CONSTS.WEBSITEFLAG.GBTEST);
  debug(`mydb find ${arrs.length} urls`);
  arrs.forEach((doc) => {
    app.analyze(doc);
  });
}


const analyzer = {
  run,
  getNotParsed,
  app,
  processMedias,
  preAndPostAnalyze,
  processUseless,
  resetSeedLists,
  // processFiles,
  // processSupportShow,
  processNews,
  processProducts,
};

init();
// run();
module.exports = analyzer;
