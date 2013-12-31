'use strict';

/* Directives */


angular.module('zoggle.directives', [])
  .directive('square', function ($window) {
  return function ($scope, $el, attrs) {
    function setHeight() {
      $el.css('height', $el.width())
    }
    $($window).bind('resize', setHeight)
    setHeight()
  }
})
  .directive('dynamicfont', function ($window) {

  return function ($scope, $el, attrs) {
    function setFont() {
      $el.css('font-size', $el.width() / attrs.dynamicfont)
    }
    $($window).bind('resize', setFont)
    setFont()
  }
})
.directive('noscroll', function($window) {
  return function ($scope, $el, attrs) {
    $el.on('touchmove', function(e) {
      e.preventDefault()
    })
  }
})
/*
  .directive('portrait', function ($window) {
  return function ($scope, $el, attrs) {
    $($window).bind('orientationchange', function (event) {
      if($($window).width() > $($window).height())
            rotate($el, -90);
    })

    function rotate(el, degs) {
      var transform = 'rotate(' + degs + 'deg)';
      var styles = {
        transform: transform,
        '-webkit-transform': transform,
        '-moz-transform': transform,
        '-o-transform': transform,
      };
      $(el).css(styles);
    }
  }
})*/
/*
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
  })*/