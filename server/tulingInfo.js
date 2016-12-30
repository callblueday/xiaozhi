var request = require('request');

Tuling = function(socket) {
  this.socket = socket;
  var that = this;


  this.getInfo = function(message) {
    // 根据输入，从图灵拿查询信息
    request.post({
      url:'http://www.tuling123.com/openapi/api',
      form: {
        "key": "6d8b646def4745e6a84bf2990d4cbc1d",
        "info": message
      }
    }, function(err, httpResponse, body){
      if (err) {
        return console.error(err);
      }
      // 获取从图灵取回的信息
      console.log(body);
      var info = JSON.parse(body).text;
      that.socket.emit('tulingResponse', info);
    })
  };

  this.socket.on("tulingRequest", function(info) {
    that.getInfo(info);
  });

};


module.exports = Tuling;