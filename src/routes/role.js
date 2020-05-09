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
    if (!check(req.body, ['desc'])) {
      throw 'bad request for endpoint, mandatory: desc';
    }
    const response = await db.query(queries.role.create,[req.body.desc]);
    req.body.id = parseInt(response.rows[0].id);
    res.status(200).send(JSON.stringify(req.body));
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(queries.role.delete,[id]);
    res.status(200).send({deleted: id});
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
    if (!check(req.body, ['desc'])) {
      throw 'bad request for endpoint, mandatory: desc';
    }
    const { id } = req.params;
    const result = await db.query(queries.role.update, [req.body.desc, id]);
    res.status(200).send({updated: id});
  } catch (e) {
    logger.error(`role.js => error: ${e}`);
    next(e);
  }
})
