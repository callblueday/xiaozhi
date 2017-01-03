
var Nightmare = require('nightmare');
var nightmare = Nightmare({
  typeInterval: 1,
  // openDevTools: {
  //   mode: 'detach'
  // },
  show: false
});

// 获取音乐相关信息
nightmare
  .goto('http://www.baidu.com')
  // .type('#kw', '夜的钢琴曲五')
  .type('#kw', '寂静之声')
  .click('#su')
  .wait('a.c-btn.op-musicsongs-select-btn')
  .click('a.c-btn.op-musicsongs-select-btn')
  .evaluate(function () {
    return document.querySelector('a.c-btn.op-musicsongs-select-btn').href;
  })
  // .end()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });

// nightmare
//   .goto('https://duckduckgo.com')
//   .type('#search_form_input_homepage', 'github nightmare')
//   .click('#search_button_homepage')
//   .wait('#zero_click_wrapper .c-info__title a')
//   .evaluate(function () {
//     return document.querySelector('#zero_click_wrapper .c-info__title a').href;
//   })
//   .end()
//   .then(function (result) {
//     console.log(result);
//   })
//   .catch(function (error) {
//     console.error('Search failed:', error);
//   });