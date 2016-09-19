
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

var drawers = [];

io.on('connection', function (socket) {

  drawers.push(socket.id);

  // -------------------------------------------------
  // Initialize
  // -------------------------------------------------
  socket.on('initialize', function() {

    var list = drawers.slice(0);
    list.splice(list.indexOf(socket.id), 1);

    socket.join(socket.id);
    socket.broadcast.emit('fetch:context', socket.id);
    io.in(socket.id).emit('fetch:drawers', list);
    socket.broadcast.emit('new:drawer', socket.id);
  });

  // -------------------------------------------------
  // Draw
  // -------------------------------------------------
  socket.on('draw', function (data) {

    socket.broadcast.emit('draw', {id: socket.id, data: data});
  });

  // -------------------------------------------------
  // Fetch
  // -------------------------------------------------
  socket.on('context:fetched', function (data) {

    io.in(data.id).emit('context:init', data.img);
  });

  // -------------------------------------------------
  // D/C
  // -------------------------------------------------
  socket.on('disconnect', function() {

    socket.broadcast.emit('dc:drawer', socket.id);

    var i = drawers.indexOf(socket.id)
    drawers.splice(i, 1);
  });
});

