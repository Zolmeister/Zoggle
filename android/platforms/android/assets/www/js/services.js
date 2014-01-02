'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('zoggle.services', [])
  .factory('checkMobile', function () {
  function checkMobile() {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  }
  return checkMobile
})