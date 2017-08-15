const Entity = require('./entity');
const debug = require('debug')('EntityService');


function handleError(err) {
  if (err) {
    debug(`Error occurred: ${err}`);
  }
  throw (err);
}

/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
async function newOneSync(obj) {
  let newobj;
  let wasCreated;
  try {
    // newobj = await Entity.create(obj);
    [newobj, wasCreated] = await Entity.findOrCreate({
      where: { url: obj.url },
      defaults: obj,
    });
  } catch (error) {
    handleError(error);
  }
  return newobj;
}
Entity.newOneSync = newOneSync;

/**
 * create or return current in db
 * 
 * @param {any} obj 
 * @param {any} cb 
 * @returns 
 */
function newOne(obj, cb) {
  // Entity
  //   .build(obj)
  //   .save()
  //   .then((entity) => { cb(entity); })
  //   .catch(error => handleError(error));
  Entity.findOrCreate({
    where: { url: obj.url },
    defaults: obj,
  }).spread((entity, created) => {
    if (created) {
      debug(`new entry created! The obj is ${JSON.stringify(obj)}`);
    } else {
      debug('try to add an existing entity');
    }
    cb(entity);
  });
}
Entity.newOne = newOne;

function updateAsyc(whereClause, updateAttrs) {
  const options = {
    // where: {title: 'aProject'},
    where: whereClause,
  };

  Entity
    .update(updateAttrs, options)
    .then((count) => {
      debug(`Update affect ${count} rows`);
      if (count > 1) {
        debug(`Update more than one row {${count}}, whereclause is ${JSON.stringify(whereClause)} `);
      }
    })
    .catch(error => handleError(error));
}
Entity.updateAsyc = updateAsyc;


module.exports = {
  newOne, newOneSync, updateAsyc,
};
