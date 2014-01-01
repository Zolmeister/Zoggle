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
  .directive('noscroll', function ($window) {
  return function ($scope, $el, attrs) {
    $el.on('touchmove', function (e) {
      e.preventDefault()
    })
  }
})
  .directive('catcher', function ($window, $timeout) {
  return function ($scope, $el, attrs) {
    if (!$scope.$last) return
    $el = $('.board-overlay')

    var targets = $el.parent().find('.' + attrs.targets)
    console.log('targets', targets)
    var positions = [];

    function cachePos() {
      positions = []
      targets.each(function (i, $el) {
        $el = $($el)
        positions.push({
          x: $el.offset().left,
          y: $el.offset().top,
          w: $el.outerWidth(),
          h: $el.outerHeight()
        })
      })
    }
    $timeout(function () {
      $timeout(cachePos, 0)
    }, 0)
    $($window).bind('resize', cachePos)

    function collide(x1, y1, w1, h1, x2, y2, w2, h2) {
      if (y1 + h1 < y2 || y1 > y2 + h2 || x1 + w1 < x2 || x1 > x2 + w2) return false;
      return true
    }

    var capturing = false
    var selected = [];

    function select(e) {
      var x = e.clientX
      var y = e.clientY
      if (!y || !x) {
        x = e.originalEvent.touches[0].clientX
        y = e.originalEvent.touches[0].clientY
      }
      
      for (var i = 0, l = positions.length; i < l; i++) {
        var p = positions[i]
        if (collide(x, y, 0, 0, p.x, p.y, p.w, p.h)) {
          if (!_.contains(selected, i)) {
            selected.push(i)
          }
          break
        }
      }

      $scope.select(selected)
    }
    $el.bind('mousedown touchstart', function (e) {
      capturing = true
      selected = []
      select(e)
    })
    $el.bind('mousemove touchmove', function (e) {
      if (capturing) {
        select(e)
      }
    })
    $el.bind('mouseup touchend', function (e) {
      capturing = false
      $scope.guess()
      selected = []
      $scope.select(selected)
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