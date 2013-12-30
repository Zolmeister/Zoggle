'use strict';

/* Controllers */

angular.module('zoggle.controllers', []).
  controller('MainCtrl', [function() {
    var socket = io.connect();
  }])