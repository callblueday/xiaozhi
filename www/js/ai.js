var socket = io.connect('127.0.0.1:3002');
var userInfo = null;

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

function getLocation() {
  var location = {
    "city": "深圳",
    "loc": '深圳市西丽366大街',
    "lon":"119.239293",
    "lat":"39.45492",
  };
  return location;
}

socket.on("tulingResponse", function(info) {
  $('.pre-show').hide();
  var message = null;
  message = info.text;
  $('#txt').text(message);
  textToSpeech(message);
  if(info.code == 100000) {
    // text

  } else if(info.code == 200000) {
    // images
    $('#imgs').show().attr("src", info.url);

  } else if(info.code == 308000) {
    // list
    // $('#list').html("");
    // var list = info.list;
    // for(var i in list) {
    //   var item =  '<tr>' +
    //                 '<td>' + list[i].name + '</td>' +
    //                 '<td>' + list[i].icon + '</td>' +
    //                 '<td>' + list[i].info + '</td>' +
    //                 '<td>' + list[i].detailurl + '</td>' +
    //               '</tr>';
    //   $('#list').show().append(item);
    // }

    var index = parseInt((info.list.length - 1) * Math.random());
    $('#imgs').show().attr("src", info.list[index].detailurl);
  }
});

// textToSpeech("呵呵");

$(function() {
  var location = getLocation();
  var data = {};

  $('.info').on('click', function() {
    var val = $('#talk').val();

    if(val.indexOf('天气') != -1 || val.indexOf('电影') != -1) {
      val += (" " + location.city);
    }

    if(val.indexOf('餐厅') != -1 || val.indexOf('酒店') != -1) {
      data.loc = location.loc;
      data.lon = location.lon;
      data.lat = location.lat;
    }

    // 向服务器通信
    data.info = val;
    socket.emit("tulingRequest", data);
  });
})
