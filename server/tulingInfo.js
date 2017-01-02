var request = require('request');

Tuling = function(socket) {
  this.socket = socket;
  var that = this;

  this.getInfo = function(data) {
    // 根据输入，从图灵拿查询信息
    request.post({
      url:'http://www.tuling123.com/openapi/api',
      form: {
        "key": "6d8b646def4745e6a84bf2990d4cbc1d",
        "info": data.info,
        "loc": data.loc || '',
        "lon": data.lon || '',
        "lat": data.lat || '',
        "userid": 'callblueday',
      }
    }, function(err, httpResponse, body){
      if (err) {
        return console.error(err);
      }
      // 获取从图灵取回的信息s
      console.log(body);
      var info = JSON.parse(body);
      that.socket.emit('tulingResponse', info);
    })
  };

  this.socket.on("tulingRequest", function(data) {
    that.getInfo(data);
  });
};


module.exports = Tuling;