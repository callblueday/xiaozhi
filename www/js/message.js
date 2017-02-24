var Message = {
  receiveVoice: function(msg) {
    console.log(msg);
    $('.box').text(msg);

    switch(msg) {
      case '前进':
        MBlockly.Action.runSpeed(255, 1);
        break;
      case '后退':
        MBlockly.Action.runSpeed(255, -1);
        break;
      case '左转':
        MBlockly.Action.turnSpeed(255, 1);
        break;
      case '前进':
        MBlockly.Action.turnSpeed(255, -1);
      case '停至':
      case '婷':
      case '停':
        MBlockly.Action.runSpeed(0, 1);
      case '开灯':
        MBlockly.Control.setMbotLed(255, 0,0, 0);
      case '关灯':
        MBlockly.Control.setMbotLed(0, 0,0, 0);
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
