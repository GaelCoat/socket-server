
'use strict';

var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var io = require('socket.io').listen(app);

app.listen(port, function () {
  console.log('App listening on port ' + port);
});

app.get('/', function (req, res) {
  res.render(__dirname, 'index.html');
});

app.use(express.static('assets'));

io.on('connection', function(socket) {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

