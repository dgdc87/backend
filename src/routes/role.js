const Router     = require('express-promise-router');
const db         = require('../db');
const { logger } = require('./../util/logger');
const queries    = require('./../queries');
const config     = require('config');
const { check }  = require('./../util/requestChecker');

const router   = new Router()
module.exports = router

router.post('/', async (req, res, next) => {
  try {
    if (!check(req.body, ['descr'])) {
      res.status(500).send(JSON.stringify({error: 'bad request for endpoint, mandatory: descr', code: 'mandatory'}));      
    }
    db.query(queries.role.create, [req.body.descr]).then( result => {
      res.status(200).send(JSON.stringify(result.insertId));
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    db.query(queries.role.delete, [id]).then( result => {
        res.status(200).send(JSON.stringify({deleted: id}));
    }, error => {
        res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})

router.get('/', async (req, res, next) => {
  try {
    db.query(queries.role.read, null).then( result => {
        res.status(200).send(JSON.stringify(result));
    }, error => {
        res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        db.query(queries.role.getById, [id]).then( result => {
            res.status(200).send(JSON.stringify(result[0]));
        }, error => {
            res.status(500).send(JSON.stringify(error));
        })
    } catch (e) {
        logger.error(`role.js => error: ${e}`);
        next(e);
    }
})

router.put('/:id', async (req, res, next) => {
  try {
    if (!check(req.body, ['descr'])) {
      res.status(500).send(JSON.stringify({error: 'bad request for endpoint, mandatory: descr', code: 'mandatory'}));   
    }
    const { id } = req.params;
    db.query(queries.role.update, [req.body.descr, id]).then( result => {
        res.status(200).send(JSON.stringify({updated: id}));
    }, error => {
        res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})
