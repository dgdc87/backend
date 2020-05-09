const express           = require('express');
const config            = require('config');
const info              = require('../package.json');
const mountRoutes       = require('./routes');
const path              = require('path');
const { logger }        = require('./util/logger');
const cors              = require('cors');
const bodyParser        = require('body-parser')
const WebSocketHandler  = require('./websockets/WebSocketHandler');

const { createDatabaseAndSchemaIfNotExists } = require('./db/dbInit');
const { jwtValidator }                       = require('./middleware/jwtValidatorMiddleware');


// all CORS requests
const app  = express();

app.use(cors());
app.use(bodyParser.json());

const http = require('http').createServer(app);
const io   = require('socket.io')(http);

app.use(express.json());
app.set('socketio', io);
app.use(jwtValidator);

mountRoutes(app);


const port = config.get('port');

webSocketHandler = new WebSocketHandler(io);
webSocketHandler.listenToSuscribtors();

// Just an exmaple of ws, TODO: remove
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../public') })
});


// Doing some actions before expose the service.
(async () => {
    logger.info("index.js => STARTING APP")
    await createDatabaseAndSchemaIfNotExists();
    http.listen(port, () => logger.info(`index.js => ${info.name}@${info.version} running at: ${port}`));
})().catch((error) => {
  logger.error(`index.js => error: ${error}`);
});
