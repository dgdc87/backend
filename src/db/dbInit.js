const config     = require('config')
const path       = require('path')
const Promise    = require('bluebird')
const fs         = require('fs')
const mysql      = require('mysql');  
const { logger } = require('./../util/logger')

let client = null;

const _createDB = async () => {
  try {
    var queries = fs.readFileSync(path.join(__dirname, './db.sql')).toString()
    .replace(/(\r\n|\n|\r)/gm," ")
    .replace(/\s+/g, ' ')
    .split(";")
    .map(Function.prototype.call, String.prototype.trim)
    .filter((el) => {return el.length != 0});
    logger.info('dbInit => Creating database');
    Promise.map(queries, (query) => {
      client.query(`${query};`, null, (err, resultados) => {
        if (err) logger.error(`dbInit.js => _createDB() => error: ${err}`)
        else logger.info(`dbInit.js => _createDB() => result: ${JSON.stringify(resultados)}`)
      });
    })
  } catch (e) {
    logger.error(`dbInit => _createTables => error : ${e}`)
  }
}

const _createTables = async () => {
    try {
      var queries = fs.readFileSync(path.join(__dirname, './db_tables.sql')).toString()
      .replace(/(\r\n|\n|\r)/gm," ")
      .replace(/\s+/g, ' ')
      .split(";")
      .map(Function.prototype.call, String.prototype.trim)
      .filter((el) => {return el.length != 0});
      logger.info('dbInit => Creating tables and populating');
      Promise.map(queries, (query) => {
        client.query(`${query};`, null, (err, resultados) => {
          if (err) logger.error(`dbInit.js => _createTables() => error: ${err}`)
          else logger.info(`dbInit.js => _createTables() => result: ${JSON.stringify(resultados)}`)
        });
      })
    } catch (e) {
      logger.error(`dbInit => _createTables => error : ${e}`)
    }
}

const _connectionClient = async () => {
  client = mysql.createConnection({
    host:     `${config.get('database.host')}`,
    port    : `${config.get('database.port')}`,
    user:     `${config.get('database.user')}`,
    password: `${config.get('database.password')}`
  })
  logger.info('dbInit => Connecting Client')
  await client.connect();
}

const _connectionClientDB = async () => {
  client = mysql.createConnection({
    host:     `${config.get('database.host')}`,
    port    : `${config.get('database.port')}`,
    user:     `${config.get('database.user')}`,
    password: `${config.get('database.password')}`,
    database: `${config.get('database.name')}`
  })
  logger.info('dbInit => Connecting DB')
  await client.connect();
}

const createDatabaseAndSchemaIfNotExists = async () => {
  try {
    logger.info("dbInit => createDatabaseAndSchemaIfNotExists");
    await _connectionClient();
    await _createDB();
    await _connectionClientDB();
    await _createTables();
    Promise.resolve();
  } catch (e) {
    logger.error(e);
  }
}

module.exports = {
  createDatabaseAndSchemaIfNotExists,
}
