var EventEmitter = require('events').EventEmitter;

var server = new EventEmitter;

server.on('error', (err) => {
	console.log(err);
});

server.emit('error', new Error("Какая то ошибка"));