const { logger } = require('./../util/logger')
const db         = require('../db');
const queries    = require('./../queries');
const { check }  = require('./../util/requestChecker');
const Promise    = require('bluebird');
const jwt        = require('jsonwebtoken');
const config     = require('config');

const jwtConfig = config.get('jwt');

const routesToFilter = {
    '/favicon.ico': [],
    '/role': [],
    '/role/*': ['GET'],
    '/users/login': [],
    '/users/logout':[],
    '/users/signin':[],
}

genericUrl = url => {
    let match = null;
    Object.keys(routesToFilter).filter( r => r.indexOf('*') >= 0).forEach( r => {
        if(url.indexOf(r.split('*')[0]) >= 0){
            match = routesToFilter[r];
        }    
    });
    return match;
}

const jwtValidator = async (req, res, next) => {
  try {
    let filter = routesToFilter[req.originalUrl] ? routesToFilter[req.originalUrl] :  genericUrl(req.originalUrl);
    if ( filter && (filter.length === 0 || filter.indexOf(req.method.toUpperCase()) >= 0 )) {
        logger.info(`jwtValidator => don´t check token for ${req.originalUrl}`);
        return next();
    }
    console.log(req.originalUrl)
    if (typeof req.get('token') === 'undefined' || req.get('token') === null) {
      throw 'Bad request for endpoint, mandatory token at headers';
    }
    const response = await db.query(queries.util.getUserJwt,[req.get('token')]);
    if (response.rows.length === 0) {
      throw 'Not valid token for request';
    }
    jwt.verify(req.get('token'), jwtConfig.secret, (error, decoded) => {
      if (typeof error === 'undefined' || error === null) {
        if (response.rows[0].username === decoded.username) {
            next();
        } else {
            throw 'Not valid token for request';
        }
      } else {
        throw error;
      }
    });
  } catch (e) {
    logger.error(`Not valid jwt: ${e}`);
    res.status(401).send(e instanceof Error ? e.stack : e);
  }
}

module.exports = {
  jwtValidator,
}
