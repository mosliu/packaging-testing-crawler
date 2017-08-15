// const Sequelize = require('sequelize');
// const db = require('../db');

const entity = require('./entity');
const { newOneSync } = require('./service');
// force: true will drop the table if it already exists
// User.sync({ force: true }).then(() =>

async function init() {
  try {
    const a = await entity.sync({ force: false });
    console.log(a);
  } catch (err) {
    console.log(err);
  }
  // await newOneSync({
  //   websiteflag: 'systester',
  //   url: 'www.lll.xom',
  // });
}


init();

module.exports = entity;
