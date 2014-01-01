'use strict';


// Declare app level module which depends on filters, and services
angular.module('zoggle', [
  'ngTouch',
  'ngAnimate',
  'ngRoute',
  'zoggle.filters',
  'zoggle.services',
  'zoggle.directives',
  'zoggle.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/zoggle.html', controller: 'MainCtrl'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
