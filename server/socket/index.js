var socketio = require('socket.io');
var connect = require('connect');
var cookie = require('cookie');
var async = require('async');
var config = require('../config/');
var sessionStore = require('../lib/sessionStore');
var HttpError = require('../error/').HttpError;
var User = require('models/user').User;

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
    console.log(`Session ${sesison.id} is anonymous`);
    return callback(null, null);
  }

  console.log(`retrieving user ${sesison.user}`);

  User.findById(session.user, function(err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }

    console.log(`user fundbyId result: ${user}`);
    callback(null, user);
  })
}

module.exports = function(server) {
  var io = socketio(server, {
    origins: 'localhost:*'
  });

  io.set('authorization', function(handshake, callback) {
    async.waterfall([
      function(callback) {
        handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        var sidCookie = handshake.cookies[config.get('session:key')];
        var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

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
        return callback(null, true);
      }

      if (err instanceof HttpError) {
        return callback(null, false);
      }

      callback(err);
    })
  })

  io.on('connection', function(socket) {
    var username = socket.handshake.user.get('username');
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
