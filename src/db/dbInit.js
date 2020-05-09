const config     = require('config')
const path       = require('path')
const Promise    = require('bluebird')
const fs         = require('fs')
const mysql      = require('mysql');  
const { logger } = require('./../util/logger')

let client = null;

const _createTables = async () => {
    try {
      var queries = fs.readFileSync(path.join(__dirname, './db.sql')).toString()
      .replace(/(\r\n|\n|\r)/gm," ")
      .replace(/\s+/g, ' ')
      .split(";")
      .map(Function.prototype.call, String.prototype.trim)
      .filter((el) => {return el.length != 0});
      logger.info('dbInit => Creating database and tables');
      Promise.map(queries, (query) => {
        client.query(`${query};`);
      })
    } catch (e) {
      logger.error(`dbInit => _createTables => error : ${e}`)
    }
}

const _connectionClientDB = async () => {
  client = mysql.createConnection({
    host:     `${config.get('database.host')}`,
    user:     `${config.get('database.user')}`,
    password: `${config.get('database.password')}`,
    database: `${config.get('database.name')}`
  })
  logger.info('dbInit => Connecting DB')
  await client.connect();
}

const createDatabaseAndSchemaIfNotExists = async () => {
  try {
    logger.info("dbInit => Checking DB");
    await _createTables();
    await _connectionClientDB();
    Promise.resolve();
  } catch (e) {
    logger.error(e);
  }
}

module.exports = {
  createDatabaseAndSchemaIfNotExists,
}
