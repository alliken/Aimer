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
    authenticate();
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
        user["password"] = $scope.user.password;
        user["email"] = $scope.user.email.toLowerCase();

        return $http({
            method: "POST",
            url: $rootScope.contextPath+"users",
            data: user
        }).success(function (data) {
            alert(data)
        });
    };

});

//User interface controller
app.controller('uiCtrl', function () {

});