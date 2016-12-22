var request = require('request');

request.post({
  url:'http://www.tuling123.com/openapi/api',
  form: {
    "key": "6d8b646def4745e6a84bf2990d4cbc1d",
    "info": "你好"
  }
}, function(err,httpResponse,body){
  if (err) {
    return console.error(err);
  }
  console.log(body);
})
