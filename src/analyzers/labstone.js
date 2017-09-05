const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:labstone');
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
  // doc.url: http://www.labstone.cn/news_detail/newsId=12.html
  // pathname: /News_Show_383.aspx
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  let newsflag = false;
  const pathnamematch = pathname.match(/\/news_detail\/newsId=/gi);
  // console.log('http://www.labstone.cn/news_detail/newsId=12.html'.match(/\/news_detail\/newsId=/gi))
  if (pathnamematch !== null) {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle =
      $('.FrontPublic_breadCrumb01-d1_c1').text()
        .replace('您现在的位置：首页', '')
        .replace('公司新闻', '')
        .replace(/>>/gm, '')
        .trim();

    doc.analyzedbody = $('#newsdetailshow').text().trim();

    const datereg = /\d+年\d+月\d+/ig;
    const datestr = $('.date').text().trim().match(datereg);
    if (datestr != null) {
      doc.bodydate = new Date(datestr[0].replace(/[年月]/igm, '-'));
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;

    newsflag = true;
  }

  if (newsflag === false) {
    next();
  }
}

async function processProducts(doc, next) {
  // doc.url: http://www.labstone.cn/product_detail/productId=90.html
  // pathname: /product_detail/productId=90.html
  const pathname = doc.pathname || url.parse(doc.url).pathname;
  let isProductFlag = false;
  let pathnamematch = pathname.match(/\/product_detail\/productId=\d+.html/gi);
  // console.log('http://www.labstone.cn/product_detail/productId=90.html'.match(/\/product_detail\/productId=\d+.html/gi))
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.name1').text().trim();
    doc.analyzedbody = $('#FrontProducts_detail02-1486697269663_subm').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
    isProductFlag = true;
  }
  pathnamematch = pathname.match(/\/product_detail\/pmcId=\d+.html/gi);
  // console.log('http://www.labstone.cn/product_detail/productId=90.html'.match(/\/product_detail\/productId=\d+.html/gi))
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.name1').text().trim();
    doc.analyzedbody = $('#FrontProducts_detail02-1486697269663_subm').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
    isProductFlag = true;
  }
  // http://en.labstone.cn/products_detail/pmcId=51.html
  pathnamematch = pathname.match(/\/products_detail\/pmcId=\d+.html/gi);
  // console.log('http://www.labstone.cn/product_detail/productId=90.html'.match(/\/product_detail\/productId=\d+.html/gi))
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.name1').text().trim();
    doc.analyzedbody = $('#FrontProducts_detail02-1486697269663_subm').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
    isProductFlag = true;
  }
  pathnamematch = pathname.match(/\/products_detail\/productId=\d+.html/gi);
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.name1').text().trim();
    doc.analyzedbody = $('#FrontProducts_detail02-1486697269663_subm').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
    isProductFlag = true;
  }
  if (!isProductFlag) {
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
  if (pathname.match(/\/Products_\d+.aspx/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/detection\/FrontColumns/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/news\/FrontColumns/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/industry\/FrontColumns/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/product\/FrontColumns/gi) != null) {
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
  if (pathname.endsWith('.pdf')) {
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
  if (doc.url.startsWith('http://en.labstone.cn/about')) {
    uselessFlag = true;
  }

  if (doc.url.startsWith('http://en.labstone.cn/industry/FrontColumns')) {
    uselessFlag = true;
  }
  if (doc.url.startsWith('http://en.labstone.cn/news/FrontColumns')) {
    uselessFlag = true;
  }
  if (doc.url.startsWith('http://en.labstone.cn/products/FrontColumns')) {
    uselessFlag = true;
  }
  if (doc.url.startsWith('http://en.labstone.cn/about/FrontColumns')) {
    uselessFlag = true;
  }
  if (doc.url.startsWith('http://en.labstone.cn/contact/')) {
    uselessFlag = true;
  }
  if (doc.url.startsWith('http://en.labstone.cn/entrust/')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/peoduct/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/peoducts/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/product/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/products/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/standard/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/detection/pmcId=')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/industry/pmcId')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/about/c')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/about/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/contact/c')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/contact/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/service/c')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/service/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/entrust/c')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/entrust/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/index/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/standard/FrontColumns')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/standard/columnsId')) {
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
  app.use(resetSeedLists);
  app.use(processFiles);
  app.use(processUseless);
  // app.use(processMedias);
  app.use(processNews);
  // app.use(processSupportShow);
  app.use(processProducts);
}
async function run() {
  const arrs = await getNotParsed(CONSTS.WEBSITEFLAG.LABSTONE);
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
