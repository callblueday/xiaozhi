var openSpeech = false;
var videoElement = null;

var Message = {
  receiveVoice: function(msg) {
    $('.box').text(msg);
    if(openSpeech) {
      textToSpeech(msg);
    }

    switch(msg) {

      case '视频':
        var src = "../media/chuyin.mp4";
        videoElement = '<video id="my-video" class="video-js" controls autoPlay preload="auto" width="100%" height="100%" data-setup="{}"><source src="' + src + '" type="video/mp4"></video>'
        $('body').append($(videoElement));
        break;
      case '退出':
        if(videoElement) {
          $('#my-video').remove();
        }
        break;
      case '聊天':
        if(mode) { openSpeech = true;}
        break;
      case '前':
      case '钱':
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
      case '停止':
      case '零':
      case '婷':
      case '停':
        MBlockly.Action.runSpeed(0, 1);
        break;
      case '开灯':
      case '灯':
        MBlockly.Control.setMbotLed(255, 0,0, 0);
        break;
      case '关灯':
        MBlockly.Control.setMbotLed(0, 0, 0, 0);
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
        $('body').css("backgroundColor",'#f00');
        break;
      case '恢复':
      case '回复':
        $('body').css("backgroundColor",'#000')
        break;
      case '全息图':
        $('.box').hide();
        $('body').css("background",'url(../../images/maxresdefault.jpg) no-repeat center 100%');
        break;
      case '小时':
      case '消失':
        $('.box').hide();
        $('body').css("background",'url()');
        break;
      case '镜像模式':
        $('.wrapper').removeClass("wrapper-all-show").addClass("wrapper-mirror");
        break;
      case '分屏模式':
        $('.wrapper').removeClass("wrapper-mirror").addClass("wrapper-all-show");
        break;
      default:
        $('.box').show();
        $('body').css("backgroundColor",'#000')
        $('body').css("background",'url()');
        break;
    }
  }
};

function showMbot() {

}
