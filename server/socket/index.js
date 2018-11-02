var socketio = require('socket.io');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var async = require('async');
var config = require('../config/');
var sessionStore = require('../lib/sessionStore');
var HttpError = require('../error/').HttpError;
var User = require('../models/user').User;

function loadSession(sid, callback) {
  sessionStore.load(sid, function(err, session) {
    if (arguments.length == 0) {
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  })
}

function loadUser(session, callback) {
  if(!session.user) {
    console.log(`Session ${session.id} is anonymous`);
    return callback(null, null);
  }

  console.log(`retrieving user ${session.user}`);

  User.findById(session.user, function(err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }

    console.log(`user fundbyId result: ${user.username}`);
    callback(null, user);
  })
}

module.exports = function(server) {
  var io = socketio(server, {
    origins: 'localhost:*'
  });

  io.use(function(socket, next) {
    var handshake = socket.request;

    async.waterfall([
      function(callback) {
        handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        var sidCookie = handshake.cookies[config.get('session:key')];
        var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
        loadSession(sid, callback);
      },
      function(session, callback) {
        if(!session) {
          callback(new HttpError(401, 'No session'));
        }

        handshake.session = session;
        loadUser(session, callback);
      },
      function(user, callback) {
        if (!user) {
          callback(new HttpError(403, 'Anonymous session may not connect'));
        }

        handshake.user = user;
        callback(null);
      },
    ], function(err) {
      if (!err) {
        return next();
      }

      if (err instanceof HttpError) {
        return next(err);
      }

      throw err;
    });
  });

  io.on('session:reload', function(sid) {
    var clients = io.clients();

    clients.forEach(client => {
      if (client.handshake.session.id != sid) return;

      loadSession(sid, function(err, session) {
        if(err) {
          client.emit("error", "server error");
          client.disconnect();
          return;
        }

        if(!session) {
          client.emit("error", "handshake unauthorized");
          client.disconnect();
          return;
        }

        client.handshake.session = session;
      })
    });
  });

  io.on('connection', function(socket) {
    var { username } = socket.request.user;
    socket.broadcast.emit('join', username);

    socket.on('message', function(msg, callback) {
      socket.broadcast.emit('message', username, msg);
      callback && callback('check');
    });

    socket.on('disconnect', function() {
      socket.broadcast.emit('leave', username);
    });
  });

  return io;
};
