var http = require('http');
var express = require('express');
var sio = require('socket.io');
var path = require('path');
var Tuling = require('./server/TulingInfo');
var Music = require('./server/Music');
var getIp = require('./js/getIp');

var app = express();
app.use(express.static(path.join(__dirname, 'www')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + 'www/index.html');
});


/**
 * 建立http服务器
 */
var httpServer = http.createServer(app);

var port = 3002;
httpServer.listen(port, function() {
  var ipList = getIp();
  for(var i in ipList) {
    console.log('http://' + ipList[i] + ":" + port);
  }
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