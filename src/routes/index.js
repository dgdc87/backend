const role        = require('./role');
const user        = require('./user');
const { logger }   = require('./../util/logger');

module.exports = app => {
  app.use('/user', user);
  app.use('/role', role);
}
