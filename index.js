
// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.set('view engine', 'pug')
// Routing
app.use(express.static(__dirname + '/assets'));

// Chatroom
app.get('/', function (req, res) {
  res.render('index');
});

io.on('connection', function (socket) {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

