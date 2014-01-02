'use strict';

/* Directives */


angular.module('zoggle.directives', [])
  .directive('square', function ($window, $timeout) {
  return function ($scope, $el, attrs) {
    function setHeight() {
      $el.css('min-height', $el.width())
    }
    $($window).bind('resize', setHeight)
    setHeight()
    $scope.$watch(function(){ return $el.width() }, setHeight)
  }
})
  .directive('dynamicfont', function ($window, $timeout) {
  return function ($scope, $el, attrs) {
    function setFont() {
      $el.css('font-size', $el.width() / attrs.dynamicfont)
    }
    $($window).bind('resize', setFont)
    /*$scope.$evalAsync(setFont)
    $scope.$watch('board', setFont, true)
    $scope.$on('$viewContentLoaded', setFont)*/
    setFont()
    $scope.$watch(function(){ return $el.width() }, setFont)
  }
})
  .directive('noscroll', function ($window) {
  return function ($scope, $el, attrs) {
    $el.on('touchmove', function (e) {
      e.preventDefault()
    })
  }
})
.directive('boardload', function($rootScope){
  return function($scope, $el, attrs) {
    if($scope.$last) {
      $rootScope.$emit('boardload')
    }
  }
})
  .directive('catcher', function ($window, $timeout, $rootScope) {
  return function ($scope, $el, attrs) {
    var positions = [];
    function cachePos() {
      var targets = $el.parent().find('.' + attrs.targets)
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
    
    $($window).bind('resize', cachePos)
    $scope.$watch(function(){ return $el.width() }, cachePos)
    $scope.$watch('board', function() {
      $timeout(function() {
        $timeout(cachePos, 0)
      }, 0)
    })
    
    $rootScope.$on('boardload', function(){
      $timeout(function() {
        $timeout(cachePos, 0)
      }, 0)
    })
    
    // seriously...
    $timeout(cachePos, 500)
    $timeout(cachePos, 1000)
    $timeout(cachePos, 5000)

    function collide(x1, y1, w1, h1, x2, y2, w2, h2) {
      if (y1 + h1 < y2 || y1 > y2 + h2 || x1 + w1 < x2 || x1 > x2 + w2) return false;
      return true
    }

    $scope.isSelecting.mouse = false
    var selected = [];

    function select(e) {
      var x = e.pageX
      var y = e.pageY
      if (!y || !x) {
        x = e.originalEvent.touches[0].clientX
        y = e.originalEvent.touches[0].clientY
      }
      
      var added = false
      for (var i = 0, l = positions.length; i < l; i++) {
        var p = positions[i]
        if (collide(x, y, 0, 0, p.x, p.y, p.w, p.h)) {
          if (!_.contains(selected, i)) {
            added = true
            selected.push(i)
          }
          break
        }
      }
      
      function touching(a, b) {
        var dirs = _.filter([-5, -4, -3, -1, 1, 3, 4, 5], function(dir) {
          var col = a%4
          if (col === 0 && (dir === -1 || dir === 3 || dir === -5)) return false
          if (col === 3 && (dir === -3 || dir === 1 || dir === 5)) return false
          return true
        })
        
        for(var i=0, l=dirs.length; i < l; i++) {
          if (a+dirs[i] === b) return true
        }
        
        return false
      }
      
      if(added) {
        var len = selected.length
        if(len > 1 && !touching(selected[len-1], selected[len-2])) {
          var start = selected[len-2]
          var end = selected[len-1]
          var startX = start % 4
          var startY = Math.floor(start / 4)
          var endX = end % 4
          var endY = Math.floor(end / 4)
          var last = selected.pop()
          
          // just in case...
          var MAX_ITER = 100
          while (!touching(start, end) && MAX_ITER) {
            // interpolate position
            if (startX < endX && startY < endY) {
              startX += 1
              startY += 1
            } else if (startX > endX && startY > endY) {
              startX -= 1
              startY -= 1
            } else if(startX < endX) {
              startX += 1
            } else if(startX > endX) {
              startX -=1
            } else if(startY < endY) {
              startY += 1
            } else {
              startY -=1
            }
            start = startY * 4 + startX
            selected.push(start)
          }
          selected.push(last)
          MAX_ITER--
        }
        $scope.select(selected)
      }
    }
    $el.bind('mousedown touchstart', function (e) {
      $scope.isSelecting.mouse = true
      selected = []
      select(e)
    })
    $el.bind('mousemove touchmove', function (e) {
      if ($scope.isSelecting.mouse) {
        select(e)
      }
    })
    $($window).bind('mouseup touchend', function (e) {
      $scope.isSelecting.mouse = false
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