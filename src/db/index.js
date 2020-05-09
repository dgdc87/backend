const mysql     = require('mysql');
const config    = require('config')

const connection = mysql.createConnection({
    host    : `${config.get('database.host')}`,
    // port    : `${config.get('database.port')}`,
    user    : `${config.get('database.user')}`,
    password : `${config.get('database.password')}`,
    database : `${config.get('database.name')}`
});

connection.connect();

module.exports = {
  query: (text, params) => new Promise((resolve, reject) => { 
    connection.query(text, params, (err, resultados) => {
      if (err) reject(err);
      else resolve(resultados);
    })
  })
}
