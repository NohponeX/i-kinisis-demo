angular.module('project', ['ngRoute'])
.config( function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'loginCtrl',
      templateUrl:'login.html'
    })
    .when('/map/', {
      controller:'MapCtrl',
      templateUrl:'map.html'
    })
    .otherwise({
      redirectTo:'/'
    });
});

function  loginCtrl($scope,$rootScope) {
	$rootScope.title = "Login";
	$rootScope.email = "gouzouni@auth.gr";
}

function MapCtrl($scope,$rootScope) {
	$rootScope.title = "Navigate";
  $rootScope.distance = 100;
	/*if( !$rootScope.email ){
		$rootScope.email = "gouzouni@auth.gr";
	}*/
	//$('#myModal').modal('show');
  map_start();
}

