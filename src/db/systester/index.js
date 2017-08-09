// const Sequelize = require('sequelize');
// const db = require('../db');

const Systester = require('./entity');
const { newOne } = require('./service');
// force: true will drop the table if it already exists
// User.sync({ force: true }).then(() =>

async function init() {
  try {
    const a = await Systester.sync({ force: true });
    console.log(a);
  } catch (err) {
    console.log(err);
  }
  await newOne({
    websiteflag: 'systester',
    url: 'www.lll.xom',
  });
}


init();

module.exports = Systester;
