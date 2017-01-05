/**
 * @fileOverview 根据查询信息，直接播放音乐
 */

var Nightmare = require('nightmare');

function Music(socket) {
  var that = this;
  this.socket = socket;
  this.songName = null;

  this.favorSongList = [
    "秋音",
    "夜的钢琴曲五",
    // "Summer",
    "阳光明媚的早晨我迟到了",
    "早晨的月亮",
    "I Believe",
    "菊次郎的夏天",
    "风中的蒲公英",
    "Childhood Memory",
    "卡农",
    "一人静",
    "Leaves in the Wind",
    "Careless Whisper",
    "不要独臂"
  ];


  this.socket.on("music", function(data) {
    that.songName = data.info && data.info.split(" ")[1] || that.favorSongList[parseInt(Math.random() * (that.favorSongList.length - 1))];
    var opt = data.opt;

    switch(data.opt) {
      case 'open':
        that.openMusicOnline();
        break;
      case 'close':
        that.closeMusicOnline();
        break;
      case 'pre':
        that.preSong();
        break;
      case 'next':
        that.nextSong();
        break;
      case 'playOrStop':
        that.playOrStop();
        break;
      default:
        break;
    }
  });

  // 查询并播放音乐：这里利用的是 nightmare 查询网易云音乐
  this.openMusicOnline = function() {
    this.nightmare = Nightmare({
      typeInterval: 1,
      // openDevTools: {
      //   mode: 'detach'
      // },
      show: false
    });

    this.nightmare
      .goto('http://www.baidu.com')
      .type('#kw', that.songName)
      .click('#su')
      .wait('a.c-btn.op-musicsongs-select-btn')
      // 直接 click 会启动窗口
      // .click('a.c-btn.op-musicsongs-select-btn')
      .evaluate(function () {
        return document.querySelector('a.c-btn.op-musicsongs-select-btn').href;
      })
      // .end()
      .then(function (result) {
        var data = {};
        data.songUrl = result;
        data.songName = that.songName;
        that.socket.emit('song', data);
        console.log(data);
      })
      .catch(function (error) {
        console.error('Search failed:', error);
      });
  }

  this.nextSong = function() {
    this.nightmare
      .wait('#J_nextBtn')
      .click('#J_nextBtn');
  }

  this.preSong = function() {
    this.nightmare
      .wait('#J_prevBtn')
      .click('#J_prevBtn');
  }

  this.playOrStop = function() {
    this.nightmare
      .wait('#J_playBtn')
      .click('#J_playBtn');
  }

  this.closeMusicOnline = function() {
    this.nightmare
      .halt();
  }
}

module.exports = Music;