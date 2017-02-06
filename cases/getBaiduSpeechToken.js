var request = require('request');

var post_data = {
  grant_type: 'client_credentials',
  client_id: 'G3bCFkXGMNGkkKZl6c5Ez09q',
  client_secret: 'b95a72265a14b193e02fa33b55c948f6'
};

request.post({
  url:'https://openapi.baidu.com/oauth/2.0/token',
  "Content-Type": "application/json",
  formData: post_data
}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log(body);
});


// {
//   "access_token": "24.2e46c39d7c905d0d43e40a4f873997df.2592000.1488987125.282335-9085373",
//   "session_key": "9mzdCXNIl2t0puqhJxFr5SGBZcCVMwU6vOoD0FLwZetwdsGoWjvXu/qvXSpfCBCC546nJCxypO6D5wr3T2OgF+babJZ6",
//   "scope": "public audio_voice_assistant_get audio_tts_post wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian wangrantest_test wangrantest_test1 bnstest_test1 bnstest_test2 ApsMisTest_Test权限",
//   "refresh_token": "25.8d681835bcc61bd43d72bd4ee8798d77.315360000.1801755125.282335-9085373",
//   "session_secret": "67e5bf1175085815f57e427095096557",
//   "expires_in": 2592000
// }