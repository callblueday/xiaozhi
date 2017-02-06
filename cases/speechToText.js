// 模拟文件post方式上传，并获取返回值
// https://www.npmjs.com/package/request

var request = require('request');
var fs = require('fs');

var formData = {
  // "format":"wav",
  "format":"speex",
  "rate":8000,
  "channel":1,
  "token":"24.2e46c39d7c905d0d43e40a4f873997df.2592000.1488987125.282335-9085373",
  "lan": "zh",
  "cuid":"callblueday",
  // "url": (__dirname + '/../media/nihao.wav'),
  // "callback": "parseSpeech",
  "len":4096,
  "speech":"xxx"
};

request.post({
  "url":'http://vop.baidu.com/server_api',
  // "Content-Type": "audio/amr;rate=8000",
  // "Content-Type": "application/json",
  "formData": {
    "format":"wav",
    "rate":8000,
    "channel":1,
    "token":"24.2e46c39d7c905d0d43e40a4f873997df.2592000.1488987125.282335-9085373",
    "lan": "zh",
    "cuid":"callblueday",
    "url": 'http://f9fa60a4.ngrok.io/AI/xiaozhi/media/nihao.wav',
    "callback": "parseSpeech"
    // "format":"speex",
    // "len":4096,
    // "speech":"xxx"
  }
}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful:', body);
});

function parseSpeech(res) {
  console.log(res);
}