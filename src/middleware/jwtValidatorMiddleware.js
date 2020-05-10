const { logger } = require('./../util/logger')
const db         = require('../db');
const queries    = require('./../queries');
const { check }  = require('./../util/requestChecker');
const Promise    = require('bluebird');
const jwt        = require('jsonwebtoken');
const config     = require('config');

const jwtConfig = config.get('jwt');

const routesToAvoidFilter = {
    '/favicon.ico': [],
    // '/role': ['GET', 'POST'],
    // '/role/*': ['GET', 'DELETE', 'PUT'],
    '/user/login': [],
    '/user/logout':[],
    '/user/signin':[],
}

genericJWTUrl = url => {
    let match = null;
    Object.keys(routesToAvoidFilter).filter( r => r.indexOf('*') >= 0).forEach( r => {
        if(url.indexOf(r.split('*')[0]) >= 0){
            match = routesToAvoidFilter[r];
        }    
    });
    return match;
}

const jwtValidator = async (req, res, next) => {
  try {
    let filter = routesToAvoidFilter[req.originalUrl] ? routesToAvoidFilter[req.originalUrl] :  genericJWTUrl(req.originalUrl);
    if ( filter && (filter.length === 0 || filter.indexOf(req.method.toUpperCase()) >= 0 )) {
        logger.info(`jwtValidator => don´t check token for ${req.originalUrl}`);
        return next();
    }
    if (typeof req.get('token') === 'undefined' || req.get('token') === null) {
      throw 'Bad request for endpoint, mandatory token at headers';
    }
    
    db.query(queries.jwt.getUserJwt, [req.get('token')]).then( response => {
      if (response.length === 0) {
        res.status(401).send(JSON.stringify('Not valid token for request'));
      }
      jwt.verify(req.get('token'), jwtConfig.secret, (error, decoded) => {
        if (typeof error === 'undefined' || error === null) {
          if (response[0].username === decoded.username) {
              next();
          } else {
            res.status(401).send(JSON.stringify('Not valid token for request => Username don´t match'));
          }
        } else {
          res.status(401).send(JSON.stringify('Not valid token for request => jwt.verify'));
        }
      });
    }, error => {
      res.status(401).send(JSON.stringify(error));
    })
    
  } catch (e) {
    logger.error(`Not valid jwt: ${e}`);
    res.status(401).send(e instanceof Error ? e.stack : e);
  }
}

module.exports = {
  jwtValidator
}
