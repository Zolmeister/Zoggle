'use strict';

/* Filters */

angular.module('zoggle.filters', [])
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse()
  };
});