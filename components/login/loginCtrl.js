// LOGIN CONTROLLER
app.controller('loginCtrl', function ($scope, $http, $rootScope, $location, $state, $window, userStorageService, Users) {
    $scope.user = $rootScope.currentUser;
    $scope.credentials = {};

    var authenticate = function (credentials, callback) {
        var headers = credentials ? {
            authorization: "Basic "
            + btoa(credentials.username + ":" + credentials.password)
        } : {};

        Users.user(headers).signin({}, function (data) {
            if (data.email) {
                userStorageService.setCurrentUser(data, true);
            }
            else {
                $rootScope.authenticated = false;
            }
            callback && callback();
        }, function () {
            $rootScope.authenticated = false;
            callback && callback();
        });
    };

    $scope.log_in = function () {
        authenticate($scope.credentials, function () {
            if ($rootScope.authenticated && $rootScope.currentUser.login) {
                $location.path('/' + $rootScope.currentUser.login)
            }
            else if ($rootScope.authenticated && !$rootScope.currentUser.login) {
                $state.go('personal');
            }
            else {
                $state.go('login_error');
            }
        });
    };

    $scope.sign_up = function () {
        var users = new User();
        users.email = $scope.user.email.toLowerCase();
        users.password = $scope.user.password;

        Users.user().create({}, users, function (data) {
            var header = {
                'username': users.email,
                'password': users.password
            };
            authenticate(header, function () {
                if ($rootScope.authenticated) {
                    $state.go('personal');
                }
            })
        }, function (data) {
            if (data.data === 'Email must be unique') {
                //TODO inform user about used email
                alert('User with this email already exists!');
            }
        });

        //$http({
        //    method: "POST",
        //    url: $rootScope.contextPath + $rootScope.restPath + "/users",
        //    data: users
        //}).success(function (data) {
        //    console.log(data);
        //    var header = {
        //        'username': users.email,
        //        'password': users.password
        //    };
        //    authenticate(header, function () {
        //        if ($rootScope.authenticated) {
        //            $state.go('personal');
        //        }
        //    });
        //});
    };

    $scope.signin = function (provider) {
        (function (url, forceReload) {
            $scope = $scope || angular.element(document).scope();
            if (forceReload || $scope.$$phase) {
                $window.location = url;
            }
            else {
                //only use this if you want to replace the history stack
                //$location.path(url).replace();

                //this this if you want to change the URL and add it to the history stack
                $location.path(url);
                $scope.$apply();
            }
        }($rootScope.contextPath + 'users/socials/' + provider, false));

    };

    $('.navigation').text('');

});