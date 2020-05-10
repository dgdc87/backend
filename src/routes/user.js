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
      res.status(500).send(JSON.stringify({error: 'bad request for endpoint, mandatory:  username, firstname, lastname, email, password', code: 'mandatory'}));   
    }
    const jwt         = await jwtGen(req.body.username);
    const date   = new Date();
    let defaultRole = 1;
    db.query(queries.role.getByDescr, ['simple']).then( result => {
      defaultRole = result[0].id;
      //username, firstname, lastname, email, id_role, pass, reg_date, update_date, last_login, jwt
      db.query(queries.user.create, [req.body.username, req.body.firstname, req.body.lastname, req.body.email, defaultRole, req.body.password, date, date, date, jwt]).then( result => {
        req.body.id = parseInt(result.insertId);
        req.body.id_role = parseInt(defaultRole);
        delete req.body.password;
        const userResponse = {
          token: jwt,
          user: req.body,
        }
        res.status(200).send(JSON.stringify(userResponse));
      }, error => {
        res.status(500).send(JSON.stringify(error));
      })
    }, error => {
        res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.post('/login', async (req, res, next) => {
  try {
    if (!check(req.body, ['username', 'password'])) {
      res.status(500).send(JSON.stringify({error: 'bad request for endpoint, mandatory:  username, password', code: 'mandatory'}));   
    }
    db.query(queries.user.credentials, [req.body.username, req.body.password]).then( response => {
      if (response.length === 0) {
        res.status(500).send(JSON.stringify({error: `Not valid credentials for user ${req.body.username}`}));
      }
      const personal  = response[0];
      const lastLogin = new Date();
      jwtGen(req.body.username).then( jwt => {
        db.query(queries.user.login, [jwt, lastLogin, personal.id]).then( result => {
          delete personal.pass;
          delete personal.jwt;
          const userResponse = {
            token: jwt,
            user: personal,
          }
          res.status(200).send(JSON.stringify(userResponse));
        }, error => {
          res.status(500).send(JSON.stringify(error));
        })
      });      
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    if (!check(req.body, ['id'])) {
      res.status(500).send(JSON.stringify({error: 'bad request for endpoint, mandatory: id'}));
    }
    db.query(queries.user.logout, [req.body.id]).then( result => {
      res.status(200).send(`User ${req.body.id} logout.`);
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
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
    db.query(queries.user.read, []).then( result => {
      res.status(200).send(JSON.stringify(result));
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    db.query(queries.user.getById, [id]).then( result => {
      if(!result || result.length === 0){
        res.status(500).send(JSON.stringify('User => user not found'));
      }else{
        res.status(200).send(result)
      }
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(`user.js => error: ${e}`);
    next(e);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    if (!check(req.body, ['firstname', 'lastname', 'email'])) {
      throw 'bad request for endpoint, mandatory: firstname, lastname, email';
    }
    const { id } = req.params
    const date = new Date().getTime();
    db.query(queries.user.update, [req.body.firstname, req.body.lastname, req.body.email, date, id]).then( result => {
      if(!result || result.affectedRows === 0){
        res.status(500).send(JSON.stringify('User => user not found'));
      }else{
        res.status(200).send({updated: id})
      }
    }, error => {
      res.status(500).send(JSON.stringify(error));
    })
  } catch (e) {
    logger.error(e)
    res.status(500).send(e)
  }
})
