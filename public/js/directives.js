'use strict';

/* Directives */


angular.module('zoggle.directives', [])
  .directive('square', function ($window) {
    return function ($scope, $el, attrs) {
        $el.css('height', $el.width())
    }
  })
  .directive('dynamicfont', function ($window) {
    return function ($scope, $el, attrs) {
      console.log(attrs.dynamicfont)
      $el.css('font-size', $el.width()/attrs.dynamicfont)
    }
  })