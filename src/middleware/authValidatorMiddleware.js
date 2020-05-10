const { logger } = require('./../util/logger')
const db         = require('../db');
const queries    = require('./../queries');
const { check }  = require('./../util/requestChecker');
const Promise    = require('bluebird');
const jwt        = require('jsonwebtoken');
const config     = require('config');

const jwtConfig = config.get('jwt');

const routesToFilter = {
    '/role': {methods: ['GET', 'POST'], validate: { role: 'admin'} },
    '/role/*': {methods: ['GET', 'DELETE', 'PUT'], validate: { role: 'admin'} },
    '/user': {methods: ['GET'], validate: { role: 'admin'} },
    '/user/*': {methods: ['GET', 'DELETE', 'PUT'], validate: { jwt: 'sameUser', orRole: 'admin'} } //Expects to have the id in the last part of the url or in the body as id
}

genericAuthUrl = url => {
    let match = null;
    Object.keys(routesToFilter).filter( r => r.indexOf('*') >= 0).forEach( r => {
        if(url.indexOf(r.split('*')[0]) >= 0){
            match = routesToFilter[r];
        }    
    });
    return match;
}

const authValidator = async (req, res, next) => {
  try {
    let filter = routesToFilter[req.originalUrl] ? routesToFilter[req.originalUrl] :  genericAuthUrl(req.originalUrl);
    if ( !filter || filter.methods.length === 0 || filter.methods.indexOf(req.method.toUpperCase()) === -1 ) {
        logger.info(`AuthValidator => don´t check auth for ${req.originalUrl}`);
        return next();
    }
    if (typeof req.get('token') === 'undefined' || req.get('token') === null) {
      throw 'AuthValidator => Auth routes require token';
    }
    if(filter.validate.role){
        db.query(queries.jwt.getRoleJwt, [req.get('token')]).then( response => {
            if (response.length === 0 || response[0].descr !== filter.validate.role) {
                res.status(401).send('Auth role error');
            }else{
                return next();
            }
        }, error => {
            res.status(401).send(JSON.stringify(error))
        })
    }
    if(filter.validate.jwt && filter.validate.jwt === 'sameUser'){
        db.query(queries.jwt.getUserJwt, [req.get('token')]).then( response => {
            const aUrl = req.originalUrl.split('/');
            const id = req.body && req.body.id ? req.body.id : aUrl[aUrl.length-1]; //Expects to have the id in the last part of the url
            if (response.length === 0 || parseInt(response[0].id) !== parseInt(id) && !filter.validate.orRole) {
                res.status(401).send('AuthValidator => Same user validation error');
            }else if(parseInt(response[0].id) !== parseInt(id) && filter.validate.orRole ){
                db.query(queries.jwt.getRoleJwt, [req.get('token')]).then( response => {
                    if (response.length === 0 || response[0].descr !== filter.validate.orRole) {
                        res.status(401).send('AuthValidator => Same user validation and role error');
                    }else{
                        return next();
                    }
                }, error => {
                    res.status(401).send(JSON.stringify(error))
                })
            }else{
                return next();
            }
        }, error => {
            res.status(401).send(JSON.stringify(error))
        })
    }
  } catch (e) {
    logger.error(`Invalid user auth: ${e}`);
    res.status(401).send(e instanceof Error ? e.stack : e);
  }
}

module.exports = {
  authValidator,
}
