const debug = require('debug')('Crawler:UrlFixer:mocon');
const url = require('url');
const CONSTS = require('../../CONSTS');

/**
 * this middleware must put at the first 
 * 
 * @param {any} doc {text:text,href:url,websiteflag:websiteflag}
 * @param {any} next 
 */
async function dropFeedback(doc, next) {
  // http://www.mocon.com/instruments/browse-instruments.html;jsessionid=C6E8D2232834A7D0EC69387B886BF213?page=4
  // pathname: '/instruments/browse-instruments.html;jsessionid=C6E8D2232834A7D0EC69387B886BF213',
  if (doc.websiteflag === CONSTS.WEBSITEFLAG.GBTEST) {
    if (doc.pathname.startsWith('/en/feedback.html?proID')) {
      doc.href = '';
      doc.fixed = true;
    }
  } else {
    await next();
  }
}

async function wrapApp(app) {
  app.use(dropFeedback);
}
module.exports = wrapApp;
