// Setup basic express server
var express = require('express');
var app = express.createServer();
var socket = require("socket.io");
var port = process.env.PORT || 3000;
var io = socket.listen(app);
app.listen(port);

io.configure(function() {
  io.set("transports", ["xhr-polling"])
  io.set("polling duration", 10)
});

io.sockets.on('connection', function(socket) {

  console.log('Connected');
});

