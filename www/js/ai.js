var socket = io.connect('127.0.0.1:3002');

function textToSpeech(text) {
  var zhText = text;
  // 文本长度必须小于1024字节
  zhText = encodeURI(zhText);
  // 语速，取值0-9，默认为5中语速
  var spd = 6;
  // 音调，取值0-9，默认为5中语调
  var pit = 7;

  var audioSrc = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=" + spd + "&text="+ zhText;
  var audio = new Audio(audioSrc);
  audio.play();
}

socket.on("tulingResponse", function(info) {
  $('#tuling-info').text(info);
  textToSpeech(info);
});

// textToSpeech("呵呵");

$(function() {
  $('.info').on('click', function() {
    var val = $('#talk').val();
    // 向服务器通信
    socket.emit("tulingRequest", val);
  });
})
