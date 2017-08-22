const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:systester');
const Organizer = require('./organizer');

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

  if ((pathname !== '/newsShow.asp') && (pathname !== '/en/newsShow.asp')) {
    next();
  } else {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = 'NEWS';
    doc.bodytitle = $('.centen2').prev('h2').text();
    doc.analyzedbody = $('.centen2').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2}/ig;
    const datestr = $('div.centen2 div span').text().match(datereg);
    if (datestr.length > 0) {
      doc.bodydate = new Date(datestr[0]);
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

async function processProducts(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if ((pathname !== '/product_Show.asp') && (pathname !== '/en/product_Show.asp')) {
    next();
  } else {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'PRODUCT';
    doc.bodytitle = $('title').text().replace('-软包装检测仪器_食品药品包装检测设备_SYSTESTER思克-济南思克测试技术有限公司', '');
    doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

async function processFiles(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if (!pathname.startsWith('/upfiles/')) {
    next();
  } else {
    debug(`Found File,id:${doc.id}`);
    // const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'FILE';
    doc.bodytitle = doc.title;
    // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

async function processSupportShow(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  if ((pathname !== '/SupportShow.asp') && (pathname !== '/en/SupportShow.asp')) {
    next();
  } else {
    debug(`Found SupportShow,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'SUPPORTSHOW';
    doc.bodytitle = $('title').text().replace('-软包装检测仪器_食品药品包装检测设备_SYSTESTER思克-济南思克测试技术有限公司', '');
    doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2}/ig;
    const datestr = $('div.centen2 div span').text().match(datereg);
    if (datestr.length > 0) {
      doc.bodydate = new Date(datestr[0]);
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

async function processUseless(doc, next) {
  // doc.url: http://systester.com/product_Show.asp?id=3235
  // pathname: /product_Show.asp
  let pathname = doc.pathname || url.parse(doc.url).pathname;
  pathname = pathname.replace(/\/en\//gm, '/');
  const uselessArray = ['/Products.asp', '/News.asp', '/AboutUs.asp', '/Support.asp', '/Customer.asp', '/index.asp', '/PersonalizedArea.asp'];
  if (!uselessArray.includes(pathname)) {
    next();
  } else {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'USELESS';
    doc.bodytitle = $('title').text().replace('-软包装检测仪器_食品药品包装检测设备_SYSTESTER思克-济南思克测试技术有限公司', '');
    // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

function init() {
// this middleware must put at the first 
  app.use(preAndPostAnalyze);
  app.use(processUseless);
  app.use(processFiles);
  app.use(processSupportShow);
  app.use(processNews);
  app.use(processProducts);
}
async function run() {
  const arrs = await getNotParsed('systester.com');
  debug(`mydb find ${arrs.length} urls`);
  arrs.forEach((doc) => {
    app.analyze(doc);
  });
}


const systester = {
  run,
  getNotParsed,
  app,
  preAndPostAnalyze,
  processUseless,
  processFiles,
  processSupportShow,
  processNews,
  processProducts,
};

init();
// run();
module.exports = systester;
