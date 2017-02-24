var http = require('http');
var express = require('express');
var sio = require('socket.io');
var path = require('path');
var Tuling = require('./server/TulingInfo');
var Music = require('./server/Music');


var app = express();
app.use(express.static(path.join(__dirname, 'www')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + 'www/index.html');
});


/**
 * 建立http服务器
 */
var httpServer = http.createServer(app);
httpServer.listen(3002, function() {
    console.log('node server start at 192.168.11.212:3002');
});


var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function (socket) {
  console.log('socket opened');
  var tuling = new Tuling(socket);
  doAfterSocketConnection(socket)
});

function doAfterSocketConnection(socket) {
  var music = new Music(socket);
}