const myDb = require('../db');
const debug = require('debug')('Analyzer:sumspring');

async function getNotParsed(website) {
  const rtn = await myDb.findAll({
    where: {
      accessed: true,
      websiteflag: 'sumspring.com',
      // isfile: false,
      analyzed: true,
    },
  });
  return rtn;
}


async function run() {
  const arrs = await getNotParsed('sumspring.com');
  debug(`mydb find ${arrs.length} urls`);
  arrs.forEach((doc) => {
    let saveflag = false;
    if (doc.bodytitle.endsWith('_包装材料检测仪器制造专家_Sumspring_济南三泉中石实验仪器有限公司')) {
      doc.bodytitle = doc.bodytitle.replace('_包装材料检测仪器制造专家_Sumspring_济南三泉中石实验仪器有限公司', '');
      debug(`findDoc${doc.id}`);
      saveflag = true;
    }
    if (doc.bodytitle.endsWith('-Jinan Sumspring Experiment Instrument Co.,ltd')) {
      doc.bodytitle = doc.bodytitle.replace('-Jinan Sumspring Experiment Instrument Co.,ltd', '');
      debug(`findDoc${doc.id}`);
      saveflag = true;
    }
    if (doc.bodytitle.endsWith('_济南三泉中石实验仪器有限公司')) {
      doc.bodytitle = doc.bodytitle.replace('_济南三泉中石实验仪器有限公司', '');
      debug(`findDoc${doc.id}`);
      saveflag = true;
    }
    if (saveflag) {
      debug(`saveDoc${doc.id}`);
      doc.save();
    }
  });
}

run()
;
