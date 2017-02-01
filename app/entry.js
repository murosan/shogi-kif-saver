'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');
const css = require('../public/stylesheets/style.css');

// ValidationEngineの読み込み
const VE = require('../public/javascripts/jquery-1.8.2.min');
const VELang = require('../public/javascripts/jquery.validationEngine-ja');
const VEJs = require('../public/javascripts/jquery.validationEngine');
const VECss = require('../public/stylesheets/validationEngine.jquery.css');
$(() => { // ValidationEngine の有効化
  jQuery('#forms').validationEngine();
});

var showKif = $('#show-kif');
var hideKif = $('#hide-kif');
var kifDiv = $('#kif-div');

showKif.click(() => { // show-kif ボタンが押された時
  kifDiv.slideDown();
  showKif.toggle();
  hideKif.toggle();
});
hideKif.click(() => { // hide-kif ボタンが押された時
  kifDiv.slideUp();
  showKif.toggle();
  hideKif.toggle();
});

var showComment = $('#show-comment');
var hideComment = $('#hide-comment');
var commentArea = $('#comment-area');

showComment.click(() => { // show-comment ボタンが押された時
  commentArea.slideDown();
  showComment.toggle();
  hideComment.toggle();
});
hideComment.click(() => { // hide-comment ボタンが押された時
  commentArea.slideUp();
  showComment.toggle();
  hideComment.toggle();
});

$('#date-area').click(() => { // 日付全選択
  select('date-area');
});


$('#kif-select').click(() => { // 棋譜全選択
  select('kif-area');
});

$('#comment-area').click(() => { // コメント全選択
  select('comment-area');
});

$('#board-on').click(() => { // 盤表示のブックマークレット
  if (select('kif-area')) {
    $('#board-on').toggle();
    $('#kif-select').toggle();
    window.location.href = "javascript:!function(){var s=document.createElement('script');s.src='https://na2hiro.github.io/Kifu-for-JS/out/public-bookmarklet.min.js',document.body.appendChild(s)}();void 0;";
  }
});
/**
 * 上記ブックマークレットの公式サイト
 * https://github.com/na2hiro/Kifu-for-JS
 */

const scrollBtn = $('#toTop'); // scroll to top button
$(window).scroll(function () {
  if ($(this).scrollTop() > 100) { // 100pxスクロールでボタンを表示
    scrollBtn.fadeIn();
  } else {
    scrollBtn.fadeOut();
  }
});
scrollBtn.click(() => { // scroll to top
  $('body,html').animate({
    scrollTop: 0
  }, 1000);
});

// 指定のテキストを全選択する
function select(id) {
  var element = document.getElementById(id);
  var range = document.createRange();
  range.selectNodeContents(element);
  var selected = window.getSelection();
  // 選択できるかどうか
  var forcusing = selected.focusNode
  if (forcusing) {
    var selectedArea = forcusing.parentElement;
    if (selectedArea && selectedArea === range.startContainer) {
      selected.addRange(range); // 選択させる
      return true;
    } else {
      alert('棋譜欄をクリックするか一部を選択してから、もう一度押してください。');
      return false;
    }
  } else {
    alert('棋譜欄をクリックするか一部を選択してから、もう一度押してください。');
    return false;
  }
}