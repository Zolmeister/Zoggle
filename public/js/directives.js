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