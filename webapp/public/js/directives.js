'use strict';

/* Directives */


angular.module('zoggle.directives', [])
  .directive('square', function ($window) {
    return function ($scope, $el, attrs) {
      $(function () {
        $el.css('height', $el.width())
      })
    }
  })
  .directive('dynamicfont', function ($window) {
    return function ($scope, $el, attrs) {
      $(function () {
        $el.css('font-size', $el.width() / attrs.dynamicfont)
      })
    }
  })
  .directive('time', function ($window) {
    return function ($scope, $el, attrs) {
      function zeroPad(number) {
        return number < 10 ? '0' + number : number
      }
      
      var time = attrs.time - attrs.timeEnd
      console.log(time, attrs.time, attrs.timeEnd)
      
      function setTime() {
        var ms = zeroPad(Math.floor(time % 1000 / 10))
        time /= 1000
        var sec = zeroPad(Math.floor(time % 60))
        time /= 60
        var min = zeroPad(Math.floor(time % 60))
        $el.text(min + ':' + sec + ':' + ms)
      }
      //setTime()
    }
  })