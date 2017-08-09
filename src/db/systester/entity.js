const Sequelize = require('sequelize');
const db = require('../db');

const Systester = db.define('crawler_systester', {

  // id
  id: { type: Sequelize.BIGINT(20), autoIncrement: true, primaryKey: true },
  websiteflag: { type: Sequelize.STRING },
  // url grabbed
  url: { type: Sequelize.STRING(500) },
  // is accessed and grab content
  accessed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  accesseDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },

  // url's text
  title: { type: Sequelize.STRING(500) },
  // content body
  // body: { type: Sequelize.TEXT('medium') },
  body: { type: Sequelize.TEXT },
  // is body analyzed
  analyzed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  // analyzed body 
  // analyzedbody: { type: Sequelize.TEXT('medium') },
  analyzedbody: { type: Sequelize.TEXT },
  // the type of the body, suchas text , file nor something.
  bodytype: { type: Sequelize.STRING },
  //
  bodytitle: { type: Sequelize.STRING(500) },
  // bodymain: { type: Sequelize.TEXT('medium') },
  bodymain: { type: Sequelize.TEXT },
  bodykey: { type: Sequelize.STRING(500) },
  bodydate: { type: Sequelize.DATE },
  // is notify relavtive people
  notified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },


});


module.exports = Systester;
