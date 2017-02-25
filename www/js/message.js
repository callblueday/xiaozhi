var openChart = false;
var videoElement = null;
var canReceiveVoice = true;

var Message = {
  receiveVoice: function(msg) {
    // if(!canReceiveVoice) {
    //   return false;
    // }
    analyse(msg);

  }
};

function analyse(msg) {
    $('.box').text(msg);
    resizeText();

    if(msg.indexOf("聊天") != -1 || msg.indexOf("疯狂聊天") != -1  || msg.indexOf("聊个天") != -1 || msg.indexOf("聊天模式") != -1 || msg.indexOf("说个话") != -1) {
      textToSpeech('进入互聊模式');
      if(mode) { openChart = true;}
    }

    if(msg.indexOf("退出") != -1 || msg.indexOf("退了") != -1) {
      textToSpeech('成功退出');

      // canReceiveVoice = false;
      // setTimeout(function() {
      //   canReceiveVoice = true;
      // }, 50);

      openChart = false;
      if(videoElement) {
        $('#my-video').remove();
      }
    }

    if(openChart) {
      // 聊天模式
      requestTulingMsg(msg);
    }

    if(msg.indexOf("全息") != -1) {
      $('.wrapper').css("backgroundImage",'url(../../images/quanxitu.jpg)!important');
      $('.box').hide();
    }

    if(msg.indexOf("退了没有") != -1 || msg.indexOf("退出没有") != -1) {
      textToSpeech('已经退出了，不要再问了');
    }

    if(msg.indexOf("叫") != -1) {
      MBlockly.Control.playTone("C6", 255);
    }

    if(msg.indexOf("大声") != -1 || msg.indexOf("我靠") != -1) {
      MBlockly.Control.playTone("C7", 1000);
    }

    if(msg.indexOf("停") != -1) {
      MBlockly.Action.runSpeed(0, 1);
    }

    if(msg.indexOf("镜像") != -1) {
      $('.wrapper').removeClass("wrapper-all-show").addClass("wrapper-mirror");
    }

    if(msg.indexOf("分屏") != -1) {
      $('.wrapper').removeClass("wrapper-mirror").addClass("wrapper-all-show");
    }

    if(msg.indexOf("视频") != -1 || msg.indexOf("播放") != -1 || msg.indexOf("初音") != -1 || msg.indexOf("来一段") != -1) {
      $('.box').hide();
      var src = "../media/chuyin2.mp4";
      videoElement = '<video id="my-video" class="video-js" autoPlay preload="auto" width="100%" height="100%" data-setup="{}"><source src="' + src + '" type="video/mp4"></video>'
      $('.wrapper').append($(videoElement));
    }

    if(msg.indexOf("关灯") != -1) {
      MBlockly.Control.setMbotLed(0, 0, 0, 0);
    }

    switch(msg) {
      case '前':
      case '前进':
        MBlockly.Action.runSpeed(255, 1);
        break;
      case '后':
      case '号':
      case '后退':
        MBlockly.Action.runSpeed(255, -1);
        break;
      case '左':
      case '做':
      case '左转':
        MBlockly.Action.turnSpeed(255, 1);
        break;
      case '右':
      case '有':
      case '右转':
        MBlockly.Action.turnSpeed(255, -1);
        break;
      case '开灯':
      case '灯':
        MBlockly.Control.setMbotLed(255, 0,0, 0);
        $('.wrapper').css("background", "#f00")
        break;
      case '黄':
      case '黄色':
      case '黄光':
        MBlockly.Control.setMbotLed(0, 0, 255, 0);
        break;
      case '蓝':
      case '蓝色':
      case '蓝光':
        MBlockly.Control.setMbotLed(0, 0, 255, 0);
        break;
      case '走你':
      case '找你':
        $('.wrapper').css("backgroundColor",'#f00');
        break;
      case '恢复':
      case '回复':
        $('.wrapper').css("backgroundColor",'#000')
        break;
      case '小时':
      case '消失':
        $('.box').hide();
        $('.wrapper').css("background",'url()');
        break;
      default:
        $('.box').show();
        $('.wrapper').css("backgroundColor",'#000')
        $('.wrapper').css("background",'url()');
        break;
    }
}

function showMbot() {

}
setTimeout(function() {
  resizeText();
}, 0);

function resizeText() {
  var left = -($('.box-down').width() / 2) + 'px';
  $('.box-down').css("marginLeft", left);
  $('.box-up').css("marginLeft", left);
}