// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
var io = require('socket.io').listen(server);
server.listen(port);

io.configure(function() {
  io.set("transports", ["xhr-polling"])
  io.set("polling duration", 10)
});

io.sockets.on('connection', function(socket) {

  console.log('Connected');
});

