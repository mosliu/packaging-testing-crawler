const Datastore = require('nedb');
const fs = require('fs');
const path = require('path');
const Tools = require('../tools');
const lxfs = require('../../utils/lxfs');
const debug = require('debug')('systesert');
const config = require('../../config');
const myDb = require('../../db/systester');
// config for this site
const siteconfig = config.crawler.systester;

const nedb = new Datastore({ filename: siteconfig.dbpath });


// const urlSeed = ['http://systester.com'];
const urlSeed = siteconfig.urlSeed;
// the url to be parsed net turn
const urlToProcess = [];
// store the url's info
const urlDict = {};

// URL.parse('http://systester.com').href;


/**
 * 
 *  
 * @param {any} obj {text:text,href:url}
 */
async function processNextUrl(obj) {
  const url2add = Tools.formatHref(obj.href);

  if (url2add === null) {
    console.log(`Wrong url:${obj.href}`);
  } else {
    const storeObj = {
      url: url2add,
      title: obj.text,
      websiteflag: 'systester.com',
    };
    if (!urlDict[url2add]) {
      // update urlDict
      urlDict[url2add] = storeObj;
      Tools.saveUrl(storeObj, siteconfig.filepath);
      // update urlToProcess List
      urlToProcess.push(url2add);
      const dbobj = {
        url: storeObj.href,
        text: storeObj.text,
        scantime: new Date(),
        visited: false,
      };
      nedb.insert(dbobj, (err, newDocs) => {
      });

      await myDb.newOne(storeObj);
      debug(`url:${url2add} pushed into urlToProcess`);
      // console.log(`url:${url2add} pushed into urlToProcess`);
    }
  }
}

async function start() {
  // const urls = await Tools.extractPageUrls('http://www.gbtest.cn/zh-CN/index.html');
  // const urls = await Tools.extractPageUrls('http://192.168.7.202');

  // First process the urls listed in the urlSeed.
  while (urlSeed.length > 0) {
    const nexturl = urlSeed.shift();
    console.log(`====processing:${nexturl}`);
    if (nexturl.endsWith('pdf')) {
      console.log('pdf!!1');
    }
    const urls = await Tools.extractPageUrls(nexturl, 'gb2312');
    await Promise.all(urls.map(async (url) => {
      const a = await processNextUrl(url);
      console.log(a);
    }));


    // urls.forEach((element) => {
    //   processNextUrl(element);
    // }, this);
  }
  // then process the urls got in seed urls
  while (urlToProcess.length > 0) {
    const nexturl = urlToProcess.shift();
    console.log(`====processing:${nexturl}`);
    if (nexturl.endsWith('pdf')) {
      console.log('pdf!!1');
    }
    const urls = await Tools.extractPageUrls(nexturl, 'gb2312');

    urls.forEach((element) => {
      processNextUrl(element);
    });

    // Set an existing field's value 
    nedb.update(
      { url: nexturl },
      { $set: { visited: true } },
      { multi: true },
      (err, numReplaced) => {
        debug(`url:${nexturl} is set to visited.${numReplaced} rows affected!`);
      },
    );
  }
  // for (const url of urls) {
  //   console.log(url);
  // }
}

function initUrlDict() {
  Tools.loadUrls(siteconfig.filepath, (data) => {
    // const urls = 
    data.split('\n').forEach((str) => {
      if (str.trim()) {
        const obj = JSON.parse(str);
        urlDict[obj.href] = obj;
      }
    });

    // console.dir(data);
  });
}

function initdb() {
  if (!fs.existsSync()) {
    lxfs.mkdirP(path.dirname(siteconfig.dbpath));
  }
  nedb.loadDatabase((err) => { // Callback is optional 
    if (err) throw err;
    debug('Db loaded');
    // Now commands will be executed 
  });
}

function initUrlToProcess() {
  nedb.find({ visited: false }, (err, docs) => {
    docs.forEach((doc) => {
      urlToProcess.push(doc.url);
    });
  });
}

function init() {
  initdb();
  initUrlToProcess();
  initUrlDict();
}
// urlToProcess.push('http://systester.com');
init();
start();

module.exports = start;
