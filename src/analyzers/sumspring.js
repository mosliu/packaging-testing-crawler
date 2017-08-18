const myDb = require('../db');
const url = require('url');
const cheerio = require('cheerio');
const debug = require('debug')('Analyzer:sumspring');
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


// 抽取形如 2017-09-12的日期
function extractDate(text) {
  if (text === null || text === '') {
    return [];
  }
  const datereg = /\d{4}-\d{2}-\d{2}/ig;
  const datestr = text.match(datereg);
  return datestr;
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


// 获取时，三泉中石会屏蔽。
async function resetBlocked(doc, next) {
  const $ = cheerio.load(doc.body);
  const title = $('title').text().trim();
  if (title === '网站防火墙') {
    debug(`Found Blocked,id:${doc.id},reset it`);
    doc.analyzed = false;
    doc.accessed = false;
    doc.needsave = true;
    doc.body = '';
  } else {
    next();
  }
}

async function processNews(doc, next) {
  // doc.url: http://systester.com/newsShow.asp?id=3637
  // pathname: /newsShow.asp
  const pathname = doc.pathname || url.parse(doc.url).pathname;

  const pathnamematch = pathname.match(/\/news\/\d+\.html/gi);
  if (pathnamematch == null) {
    next();
  } else {
    debug(`Fount News,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    doc.bodytype = 'NEWS';
    doc.bodytitle = $('title').text().trim();
    doc.analyzedbody = $('#con').text().trim();

    const datestr = extractDate($('.info').text());

    if (datestr.length > 0) {
      doc.bodydate = new Date(datestr[0]);
    } else {
      doc.accessed = false;
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
  // http://www.sumspring.cn/supply/Products_2.html
  // http://www.sumspring.cn/supply/99.html
  const pathnamematch = pathname.match(/\/supply\/\d+\.html/gi);
  if (pathnamematch == null) {
    next();
  } else {
    debug(`Found Product,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'PRODUCT';
    doc.bodytitle = $('title').text().replace('_包装材料检测仪器制造专家_Sumspring_济南三泉中石实验仪器有限公司', '');
    doc.analyzedbody = $('.ovflow').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
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
  const pathname = doc.pathname || url.parse(doc.url).pathname;
  let pathnamematch = pathname.match(/\/News\/News_\d+\.html/gi);
  let nouseflag = false;
  if (pathnamematch !== null) {
    nouseflag = true;
  }

  pathnamematch = pathname.match(/\/khal\/News_\d+\.html/gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/slbzjcyq\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/zbzysjcyq\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/zzpbzjcyq\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/gsxw\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/jzfa\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/hyzx\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/ypbzjcyq\//gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/supply\/Products_\d+\.html/gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }
  pathnamematch = pathname.match(/\/about\/about/gi);
  if (pathnamematch !== null) {
    nouseflag = true;
  }

  if (nouseflag === false) {
    next();
  } else {
    debug(`Found Useless,id:${doc.id}`);
    const $ = cheerio.load(doc.body);
    doc.analyzed = true;
    // TODO  news product need to be cast to constvalue
    doc.bodytype = 'USELESS';
    doc.bodytitle = $('title').text().replace('济南三泉中石实验仪器有限公司', '').trim();
    // doc.bodytitle = $('title').text().replace('----Oxygen permeability tester|Permeation testing instruments|Water Vapor Transmission Rate|WVTR|OTR|GTR|Laboratory equipment||Pouch spout inserting machine', '');
    // doc.analyzedbody = $('table[style$="border-top:none"]').text().trim();
    // empty body field save the mysql space
    doc.body = '';
    doc.needsave = true;
  }
}

function init() {
  // this middleware must put at the first 
  app.use(preAndPostAnalyze);
  app.use(resetBlocked);
  app.use(processProducts);
  app.use(processNews);
  // app.use(resetSeedLists);
  // app.use(processMedias);
  // app.use(processFiles);
  // app.use(processSupportShow);
  app.use(processUseless);
}
async function run() {
  const arrs = await getNotParsed('sumspring.com');
  debug(`mydb find ${arrs.length} urls`);
  arrs.forEach((doc) => {
    app.analyze(doc);
  });
}


const analyzer = {
  app,
  getNotParsed,
  preAndPostAnalyze,
  resetBlocked,
  processMedias,
  processUseless,
  resetSeedLists,
  // processFiles,
  // processSupportShow,1
  processNews,
  processProducts,
  run,
};

init();
run();
module.exports = analyzer;
