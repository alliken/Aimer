var app = angular.module('aimer', ['ui.router', 'uiRouterStyles']);
app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                controller: 'navCtrl',
                resolve: {
                    auth: ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {
                        return $http.get('users', {headers: {}}).success(function (data) {
                        if (data.name) {
                            $rootScope.userLogin = data.name;
                            $rootScope.authenticated = true;
                            $location.path('/user');
                        } else {
                            $location.path('/login');
                            $rootScope.authenticated = false;
                        }
                        }).error(function () {
                            $rootScope.authenticated = false;
                        });
                    }]
                }
                     
            })
            .state('login_error', {
                url: '/login_error',
                templateUrl: 'login_error.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/login_error.css'
                }
            })
            .state('user', {
                url: '/user',
                templateUrl: 'user.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/user.css'
                }
            }).state('login', {
                url: '/login',
                templateUrl: 'login.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/login.css'
                }
            });
    }]);

// Navigation controller
app.controller('navCtrl', function ($scope, $http, $rootScope, $location) {
    $scope.user = {};
    $rootScope.contextPath = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("#"));
    $scope.isEmpty = false;
    $scope.credentials = {};

    var authenticate = function (credentials, callback) {
            var headers = credentials ? {
                authorization: "Basic "
                + btoa(credentials.username + ":" + credentials.password)
            } : {};

            $http.get('users', {headers: headers}).success(function (data) {
                if (data.name) {
                    $rootScope.userLogin = data.name;
                    $rootScope.authenticated = true;
                } else {
                    $rootScope.authenticated = false;
                }
                callback && callback();
            }).error(function () {
                $rootScope.authenticated = false;
                callback && callback();
            });
    };

    $scope.login = function () {
        authenticate($scope.credentials, function () {
            if ($rootScope.authenticated) {
                $scope.error = false;
                $location.path('/user');
            } else {
                $location.path('/login_error');
                $scope.error = true;
            }
        });
    };

    $scope.logout = function () {
        $http.post('logout', {}).success(function () {
            $rootScope.authenticated = false;
            $location.path($rootScope.contextPath + '/');
        }).error(function () {
            $rootScope.authenticated = false;
            $location.path($rootScope.contextPath + '/');
        });
    };

    $scope.sign_up = function () {
        var user = dto["user"];
        user["login"] = $scope.user.login;
        user["password"] = $scope.user.password;
        user["email"] = $scope.user.email.toLowerCase();

        return $http({
            method: "POST",
            url: $rootScope.contextPath+"/users",
            data: user
        }).success(function (data) {
            alert(data)
        });
    };

});

//User interface controller
app.controller('uiCtrl', function ($scope, $http, $rootScope, $location) {
   // ($rootScope.authenticated) ? ($location.path('/user')) : ($location.path('/login'));
});


//var app = angular.module('aimer', ['ui.router', 'routeStyles']);
//app.config(['$routeProvider', '$httpProvider',
//    function ($routeProvider, $httpProvider) {
//        $routeProvider
//            .when('/', {
//                templateUrl: 'login.html',
//                controller: 'navCtrl',
//                css: 'css/login.css'
//            }).when('/login_error', {
//                templateUrl: 'login_error.html',
//                controller: 'navCtrl',
//                css: 'css/login_error.css'
//            }).when('/user', {
//                templateUrl: 'user.html',
//                controller: 'uiCtrl',
//                css: 'css/user.css'
//            }).otherwise({
//                redirectTo: '/'
//            });
//        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
//    }]);