const Router     = require('express-promise-router');
const db         = require('../db');
const { logger } = require('./../util/logger');
const queries    = require('./../queries');
const config     = require('config');
const { check }  = require('./../util/requestChecker');

const { jwtGen } = require('../controllers/jwtController');

const router   = new Router();
module.exports = router;

router.post('/signin', async (req, res, next) => {
  try {
    if (!check(req.body, ['username', 'firstname', 'lastname', 'email', 'password'])) {
      throw 'bad request for endpoint, mandatory: username, firstname, lastname, email, password';
    }
    const jwt         = await jwtGen(req.body.username);
    const date   = new Date().getTime();
    const defaultRole = 1;
    //username, firstname, lastname, email, id_role, pass, reg_date, update_date, last_login, jwt
    const response = await db.query(queries.personal.create,[req.body.username, req.body.firstname, req.body.lastname, req.body.email, defaultRole, req.body.password, date, date, date, jwt]);
    req.body.id = parseInt(response.rows[0].id);
    delete req.body.password;
    const userResponse = {
      token: jwt,
      user: req.body,
    }
    res.status(200).send(JSON.stringify(userResponse));
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.post('/login', async (req, res, next) => {
  try {
    if (!check(req.body, ['username', 'password'])) {
      throw 'bad request for endpoint, mandatory: username, password';
    }
    const response = await db.query(queries.personal.credentials,[req.body.username, req.body.password]);
    if (response.rows.length === 0) {
      throw `Not valid credentials for user ${req.body.username}`;
    }
    const personal  = response.rows[0];
    const jwt       = await jwtGen(req.body.username);
    const lastLogin = new Date();
    const result    = await db.query(queries.personal.login,[jwt, personal.id, lastLogin]);
    delete personal.password;
    delete personal.jwt;
    const userResponse = {
      token: jwt,
      user: personal,
    }
    res.status(200).send(JSON.stringify(userResponse));
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    if (!check(req.body, ['id'])) {
      throw 'bad request for endpoint, mandatory: id';
    }
    const result = await db.query(queries.personal.logout,[req.body.id]);
    res.status(200).send(`User ${req.body.id} logout.`);
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(queries.personal.delete,[id]);
    res.status(200).send({deleted: id});
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.get('/', async (req, res, next) => {
  try {
    const { id } = req.params;
    const offset = req.query.offset;
    const result = await db.query(queries.personal.read);
    res.status(200).send(JSON.stringify(result.rows));
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(queries.personal.getById, [id]);
    res.status(200).send(JSON.stringify(result.rows));
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    if (!check(req.body, ['username', 'firstname', 'lastname', 'email', 'id_role', 'login'])) {
      throw 'bad request for endpoint, mandatory: username, firstname, lastname, email, id_role, login';
    }
    const { id } = req.params
    const date = new Date().getTime();
    // UPDATE user SET username = $1, firstname = $2, lastname = $3, email = $4, id_role = $5, update_date = $6
    const result = await db.query(queries.personal.update, [req.body.username, req.body.firstname, req.body.lastname, req.body.email, req.body.id_role, date, id])
    res.status(200).send({updated: id})
  } catch (e) {
    logger.error(e)
    res.status(500).send(e)
  }
})
