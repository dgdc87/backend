const { logger } = require('./../util/logger');

class WebSocketHandler {

  constructor(io) {
    this.io     = io;
 }

 connetions = 0;

  listenToSuscribtors = () => {
    this.io.sockets.on('connection', (sckt) => {
      this.connetions++;
      logger.debug('websocket: a user connected');
      sckt.on('subscribeTo', (room)=> {
        logger.debug('joining to room ' + room);
        sckt.join(room);
      });

      sckt.on('unsubscribeFrom', (room)=> {
        logger.debug('leaving: ' + room);
        sckt.leave(room);
      });

      this.io.sockets.emit('user-connected', this.connetions)
    });
  }

  sendAlarm = (area, type, data) => {
    this.io.sockets.in(area).emit(type, data);
  }

}

module.exports = WebSocketHandler
