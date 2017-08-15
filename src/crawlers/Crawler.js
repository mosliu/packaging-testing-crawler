const fs = require('fs');
const path = require('path');
const lxfs = require('..//utils/lxfs');
// const Datastore = require('nedb');
const Debug = require('debug');
const Tools = require('./tools');
const myDb = require('../db');


/* *************************private methods ************************* */
function initdb() {
  if (!fs.existsSync()) {
    lxfs.mkdirP(path.dirname(this.siteconfig.dbpath));
  }
  // this.nedb = new Datastore({ filename: this.siteconfig.dbpath });
  // this.nedb.loadDatabase((err) => { // Callback is optional 
  //   if (err) throw err;
  //   this.debug('Db loaded');
  //   // Now commands will be executed 
  // });
}

/**
   * Load UrlDict from saved file
   * 
   * @memberof Crawler
   */
function initUrlDict() {
  Tools.loadUrls(this.siteconfig.filepath, (data) => {
    // const urls = 
    data.split('\n').forEach((str) => {
      if (str.trim()) {
        const obj = JSON.parse(str);
        this.urlDict[obj.url] = obj;
      }
    });
    this.debug(`Load UrlDict from saved file:${this.siteconfig.filepath}`);
  });
}

/**
   * Load UrlDict from Nedb
   * 
   * @memberof Crawler
   */
function initUrlToProcess() {
  myDb.findAll({
    where: {
      accessed: false,
      websiteflag: this.siteconfig.websiteflag,
      isfile: false,
    },
  }).then((arr) => {
    arr.forEach((doc) => {
      this.urlToProcess.push(doc.url);
    });
    console.log(`mydb find ${arr.length} urls`);
  });


  // this.nedb.find({ visited: false }, (err, docs) => {
  //   docs.forEach((doc) => {
  //     this.urlToProcess.push(doc.url);
  //   });
  //   this.debug(`Loaded urlToProcess from nedb,num:${docs.length}`);
  // });
}

/**
 * Judge a url is or not a Document file.return false if it is a webpage.
 * 
 * @param {any} url 
 * @returns 
 */
function judgedDocFile(url) {
  let flag = false;
  if (url.endsWith('.pdf')) {
    flag = true;
  }
  return flag;
}

/**
 * 
 *  
 * @param {any} obj {text:text,href:url}
 */
function processNextUrl(obj) {
  const url2add = Tools.formatHref(obj.href);

  if (url2add === null) {
    this.debug(`Wrong url:${obj.href}`);
  } else {
    const storeObj = {
      url: url2add,
      title: obj.text,
      websiteflag: this.siteconfig.websiteflag,
    };
    if (!this.urlDict[url2add]) {
      const fileflag = judgedDocFile(url2add);
      storeObj.isfile = fileflag;
      // update urlDict
      this.urlDict[url2add] = storeObj;
      Tools.saveUrl(storeObj, this.siteconfig.filepath);
      // update urlToProcess List
      if (!fileflag) {
        this.urlToProcess.push(url2add);
        // this.debug(`urlToProcess List added new url:${url2add}`);
        // const dbobj = {
        //   url: storeObj.url,
        //   text: storeObj.title,
        //   scantime: new Date(),
        //   visited: false,
        // };
        // this.nedb.insert(dbobj, (err, newDocs) => { });
      }

      // await myDb.newOneSync(storeObj);
      myDb.newOne(storeObj, (aobj) => { });
      this.debug(`url:${url2add} pushed into urlToProcess`);
      // console.log(`url:${url2add} pushed into urlToProcess`);
    }
  }
}

/* *************************class defination************************* */
class Crawler {
  constructor(siteconfig) {
    this.siteconfig = siteconfig;
    this.debug = Debug(`crawler_${siteconfig.name}`);

    this.urlToProcess = [];
    this.urlDict = {};
    this.concurrency = 3;
    // init 
    initdb.call(this);
    initUrlDict.call(this);
    initUrlToProcess.call(this);
  }

  async start() {
    // const urls = await Tools.extractPageUrls('http://www.gbtest.cn/zh-CN/index.html');
    // const urls = await Tools.extractPageUrls('http://192.168.7.202');
    this.urlToProcess = this.siteconfig.urlSeed.concat(this.urlToProcess);
    // First process the urls listed in the urlSeed.
    // then process the urls got in seed urls
    while (this.urlToProcess.length > 0) {
      if (this.concurrency === 0) {
        continue;
      } else {
        this.concurrency = this.concurrency - 1;
      }
      const nexturl = this.urlToProcess.shift();
      this.debug(`====processing:${nexturl}`);
      const pageinfo = await Tools.extractPageInfos(nexturl, this.siteconfig.pageencode);

      myDb.updateAsyc({ url: pageinfo.refurl }, { accessed: true, body: pageinfo.body });
      const urls = pageinfo.urls;

      urls.forEach((element) => {
        processNextUrl.call(this, element);
      });

      /** *不要删，学习怎么await foreach */
      // await Promise.all(urls.map(async (url) => {
      //   const a = await processNextUrl(url);
      //   console.log(a);
      // }));
      // Set an existing field's value 

      // this.nedb.update(
      //   { url: nexturl },
      //   { $set: { visited: true } },
      //   { multi: true },
      //   (err, numReplaced) => {
      //     this.debug(`url:${nexturl} is set to visited.${numReplaced} rows affected!`);
      //   },
      // );
    }

    this.debug(`This Crawler Turn For ${this.siteconfig.websiteflag} is Finished.`);
    // for (const url of urls) {
    //   console.log(url);
    // }
  }
}
module.exports = Crawler;
