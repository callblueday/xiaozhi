var http = require('http');

var qs = require('querystring');

var post_data = {
  grant_type: 'client_credentials',
  client_id: 'G3bCFkXGMNGkkKZl6c5Ez09q',
  client_secret: 'b95a72265a14b193e02fa33b55c948f6'
};

var content = qs.stringify(post_data);

var options = {
  hostname: 'https://openapi.baidu.com',
  path: 'oauth/2.0/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
};

var req = http.request(options, function (res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function (e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(content);

req.end();