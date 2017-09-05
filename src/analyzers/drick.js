const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:drick');
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
  // doc.url: http://www.drick.cn/News_Show_383.aspx
  // pathname: /News_Show_383.aspx
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  let newsflag = false;
  let pathnamematch = pathname.match(/\/News_Show_\d+.aspx/gi);
  // console.log('http://www.drick.cn/News_Show_383.aspx'.match(/\/News_Show_\d+.aspx/gi))
  if (pathnamematch !== null) {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('.tie').text().trim();
    doc.analyzedbody = $('.tit_4').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2}/ig;
    const datestr = $('.tit_5').text().match(datereg);
    if (datestr != null) {
      doc.bodydate = new Date(datestr[0]);
    }
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;

    newsflag = true;
  }
  // 匹配en版本 和 es版本
  pathnamematch = pathname.match(/\/e[ns]\/NewsInfo.aspx/gi);
  // console.log('http://www.drick.cn/en/NewsInfo.aspx?nid=99'.match(/\/en\/NewsInfo.aspx/gi))
  // console.log('http://www.drick.cn/en/NewsInfo.aspx?nid=99'.match(/\/e[ns]\/NewsInfo.aspx/gi))
  if (pathnamematch !== null) {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.NEWS;
    doc.bodytitle = $('#ContentPlaceHolder1_Label2').text().trim();
    doc.analyzedbody = $('#ContentPlaceHolder1_Label6').text().trim();
    const datereg = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/ig;
    const datestr = $('#ContentPlaceHolder1_Label4').text().match(datereg);
    if (datestr != null) {
      doc.bodydate = new Date(datestr[0]);
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
  // doc.url: http://www.drick.cn/Pro_Show_461.aspx
  // pathname: /Pro_Show_461.aspx
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  const pathnamematch = pathname.match(/\/Pro_Show_\d+.aspx/gi);
  // console.log('http://www.drick.cn/News_Show_383.aspx'.match(/\/News_Show_\d+.aspx/gi))
  if (pathnamematch !== null) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('.l_pm').text().trim();
    doc.analyzedbody = $('.right').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  } else if (pathname.startsWith('/en/ProductInfo.aspx') || pathname.startsWith('/es/ProductInfo.aspx')) {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = CONSTS.INFOTYPE.PRODUCT;
    doc.bodytitle = $('#ContentPlaceHolder1_Label2').text().trim();
    doc.analyzedbody = $('.neirong').text().trim();
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
  if (pathname.match(/\/Products.aspx/gi) != null) {
    seedflag = true;
  }
  if (pathname.match(/\/News.aspx/gi) != null) {
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
  }
  if (pathname.endsWith('.doc')) {
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
  if (pathname.match(/\/Products_\d+.aspx/gi) != null) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/en/Message.aspx')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/es/Message.aspx')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/en/ProductList')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/es/ProductList')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/About')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/News_1')) {
    uselessFlag = true;
  }
  if (pathname.startsWith('/ru/')) {
    // ru语言根本没写啊。。
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
  app.use(processUseless);
  app.use(processFiles);
  app.use(processMedias);
  app.use(processNews);
  // app.use(processSupportShow);
  app.use(processProducts);
}
async function run() {
  const arrs = await getNotParsed(CONSTS.WEBSITEFLAG.DRICK);
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
