var http = require('http');
var express = require('express');
var sio = require('socket.io');
var path = require('path');
var Tuling = require('./server/TulingInfo');
var UserInfo = require('./server/UserInfo');


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
    console.log('node server start at http://127.0.0.1:3002');
});


var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function (socket) {
  console.log('socket opened');
  var tuling = new Tuling(socket);
  doAfterSocketConnection(socket)
});

function doAfterSocketConnection(socket) {
  socket.emit('userinfo', UserInfo);
}