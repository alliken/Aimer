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
                        aut($http, $rootScope, $location, '/user', '/login')}]
                }})
            .state('login_error', {
                url: '/login_error',
                resolve: {
                    auth: ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {
                        aut($http, $rootScope, $location, '/user','/login_error')}]
                },
                templateUrl: 'login_error.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/login_error.css'
                }
            })
            .state('user', {
                url: '/user',
                resolve: {
                    auth: ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {
                        aut($http, $rootScope, $location, '/user','/login')}]
                },
                templateUrl: 'user.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/user.css'
                }
            }).state('login', {
                url: '/login',
                resolve: {
                    auth: ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {
                        aut($http, $rootScope, $location, '/user')}]
                },
                templateUrl: 'login.html',
                controller: 'navCtrl',
                data: {
                    css: 'css/login.css'
                }
            });

        // Authentication function for routing. path1 - path when user is authenticated, path2 - not.
        var aut =  function ($http, $rootScope, $location, path1, path2) {
            return $http.get('users', {headers: {}}).success(function (data) {
                if (data.name) {
                    $rootScope.userLogin = data.name;
                    $rootScope.authenticated = true;
                    $location.path(path1);
                } else {
                    $rootScope.authenticated = false;
                    if (path2) $location.path(path2);
                }
            });
        };
    }]);