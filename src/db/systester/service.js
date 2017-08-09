const Entity = require('./entity');

async function newOne(obj) {
  let newobj;
  try {
    newobj = await Entity.create(obj);
  } catch (error) {
    console.log(error);
  }

  return newobj;
}
Entity.newOne = newOne;

module.exports = {
  newOne,
};
