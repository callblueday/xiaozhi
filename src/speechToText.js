// 模拟文件post方式上传，并获取返回值
// https://www.npmjs.com/package/request


var request = require('request');
request('http://www.baidu.com', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  }
})