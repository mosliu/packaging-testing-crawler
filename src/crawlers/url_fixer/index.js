const Organizer = require('../../utils/engine');
const debug = require('debug')('UrlFixer');
const url = require('url');
// const CONSTS = require('../../CONSTS');
const moconInit = require('./mocon');
const gbtsetInit = require('./gbtest');

const app = new Organizer();

/**
 * this middleware must put at the first 
 * 
 * @param {any} doc {text:text,href:url,websiteflag:websiteflag}
 * @param {any} next 
 */
async function preAndPostAnalyze(doc, next) {
  // save the current value
  const backup = {};
  backup.text = doc.text;
  backup.href = doc.href;
  doc.backup = backup;

  const parsedUrl = url.parse(doc.href);
  doc.parsedUrl = parsedUrl;
  // eslint-disable-next-line
  doc.pathname = parsedUrl.pathname;
  // @param {any} doc {text,href:url,websiteflag,parsedUrl,pathname}
  await next();
  if (doc.fixed) {
    debug('doc is fixed');
  }
}


// let a = 'http://www.mocon.com/instruments/browse-instruments.html;jsessionid=C6E8D2232834A7D0EC69387B886BF213?page=4';
// a = a.replace(/;jsessionid=.+\?/gm, '?');
// const b = require('url').parse(a);

// console.log(b.pathname);
// console.log(b);


app.use(preAndPostAnalyze);
moconInit(app);
gbtsetInit(app);
// app.use(moconRemoveJsessionId);

module.exports = app;
