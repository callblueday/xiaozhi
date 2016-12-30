// 模拟文件post方式上传，并获取返回值
// https://www.npmjs.com/package/request


var request = require('request');
var fs = require('fs');
// request('http://www.baidu.com', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body);
//   }
// });

var formData = {
  "format":"wav",
  "rate":8000,
  "channel":1,
  "token":"24.61399cfb279ea95aee1d9ea4ddbfb478.2592000.1484758685.282335-9085373",
  "cuid":"callblueday",
  "speech": fs.createReadStream(__dirname + '/../media/nihao.wav'),
};

request.post({
  url:'http://vop.baidu.com/server_api',
  "Content-Type": "application/json",
  formData: formData
}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful:', body);
});