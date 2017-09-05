const debug = require('debug')('Crawler:UrlFixer:mocon');
const url = require('url');
const CONSTS = require('../../CONSTS');

/**
 * this middleware must put at the first 
 * 
 * @param {any} doc {text:text,href:url,websiteflag:websiteflag}
 * @param {any} next 
 */
async function moconRemoveJsessionId(doc, next) {
  // http://www.mocon.com/instruments/browse-instruments.html;jsessionid=C6E8D2232834A7D0EC69387B886BF213?page=4
  // pathname: '/instruments/browse-instruments.html;jsessionid=C6E8D2232834A7D0EC69387B886BF213',
  if (doc.websiteflag === CONSTS.WEBSITEFLAG.MOCON) {
    const fixPath = doc.href.replace(/;jsessionid=.+\?/gm, '?');
    if (doc.href === fixPath) {
    // no need fixed
    } else {
      debug('removed jsessionid');
      doc.href = fixPath;
      doc.parsedUrl = url.parse(doc.href);
      doc.pathname = doc.parsedUrl.pathname;
      doc.fixed = true;
    }
  }
  await next();
}

async function wrapApp(app) {
  app.use(moconRemoveJsessionId);
}
module.exports = wrapApp;
