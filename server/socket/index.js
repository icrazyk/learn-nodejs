var socketio = require('socket.io');

module.exports = function(server) {
  var io = socketio(server, {
    origins: 'localhost:*'
  });

  io.on('connection', function(socket){
    socket.on('message', function(msg, callback) {
      socket.broadcast.emit('message', msg);
      callback('check');
    });
  });
};
