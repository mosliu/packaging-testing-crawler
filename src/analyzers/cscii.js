const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:cscii');
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
  // doc.url: http://cscii.com/3393.html
  // pathname: 3393.html
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  let newsflag = false;
  let pathnamematch = pathname.match(/\d{4,5}.html/gi);
  // console.log('http://cscii.com/3393.html'.match(/\d{4,5}.html/gi))
  if (pathnamematch !== null) {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('.entry-title').text().trim();
    doc.analyzedbody = $('.entry-content').text().trim();
    // console.log('2017年1月13日'.replace(/[年月]/igm,'-').replace(/日/igm,''))

    const datereg = /\d+年\d+月\d+/ig;
    const datestr = $('.updated.hidden').text().trim().match(datereg);
    if (datestr != null) {
      doc.bodydate = new Date(datestr[0].replace(/[年月]/igm, '-'));
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;

    newsflag = true;
  }

  pathnamematch = pathname.match(/\/project-details\//gi);
  // console.log('http://cscii.com/3393.html'.match(/\d{4,5}.html/gi))
  if (pathnamematch !== null) {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('title').text().replace('-济南赛成电子科技有限公司', '').trim();
    doc.analyzedbody = $('#main_content').text().trim();

    // TODO no date,need to consider later if this would affect show 
    doc.body = '';
    doc.needsave = true;

    newsflag = true;
  }


  if (newsflag === false) {
    next();
  }
}

async function processProducts(doc, next) {
  // doc.url: http://cscii.com/product-details/zdy-02-abpzly
  // pathname: /product-details/zdy-02-abpzly
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  const pathnamematch = pathname.match(/\/product-details\//gi);
  // console.log('http://www.labstone.cn/product_detail/productId=90.html'.match(/\/product_detail\/productId=\d+.html/gi))
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.page-title').text().trim();
    doc.analyzedbody = $('.product_content_row').text().trim();
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

  // http://www.drick.cn/Products_107.aspx
  let seedflag = false;
  if (pathname.match(/\/products\//gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/industry-news/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/news/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/our-products/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/portfolio\/customer/gi) != null) {
    seedflag = true;
  }

  if (seedflag) {
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

  if (pathname.startsWith('/DrickVideo.aspx')) {
    debug(`Found Medias,id:${doc.id}`);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.MEDIA;
    doc.bodytitle = doc.title;
    doc.body = '';
    doc.needsave = true;
  } else {
    next();
  }
}

async function processFiles(doc, next) {
  // doc.url: http://www.drick.cn/sys_manager/images/pdf/20170623021505.pdf
  // pathname: /sys_manager/images/pdf/20170623021505.pdf
  const pathname = doc.pathname || url.parse(doc.url).pathname;
  // if('/sys_manager/images/pdf/20170623021505.pdf'.endsWith('.pdf'))console.log(1)
  if (doc.isfile === true || pathname.endsWith('.pdf')) {
    debug(`Found File,id:${doc.id}`);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.FILE;
    doc.bodytitle = doc.title;
    doc.body = '';
    doc.needsave = true;
  } else {
    next();
  }
}

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
  const pathname = doc.pathname || url.parse(doc.url).pathname;
  let uselessFlag = false;
  if (pathname.startsWith('/industry-news/page')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/news/page')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/tag/')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/our-products/page')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/portfolio/customer/')) {
    uselessFlag = true;
  }
  if (uselessFlag) {
    debug(`Found Useless,id:${doc.id}`);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.USELESS;
    doc.bodytitle = doc.title;
    doc.body = '';
    doc.notuseful = true;
    doc.needsave = true;
  } else {
    next();
  }
}

function init() {
// this middleware must put at the first 
  app.use(preAndPostAnalyze);
  app.use(processFiles);
  app.use(processUseless);
  app.use(resetSeedLists);
  // app.use(processMedias);
  app.use(processNews);
  // app.use(processSupportShow);
  app.use(processProducts);
}
async function run() {
  const arrs = await getNotParsed(CONSTS.WEBSITEFLAG.CSCII);
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
