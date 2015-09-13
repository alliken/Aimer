app.lazy.controller('pswRecoveryCtrl', function ($scope, $rootScope, $http, $location, userStorageService, $stateParams,
                                                 $state) {
    $rootScope.contextPath = userStorageService.contextPath();
    $scope.recovery = {
        'email': '',
        'password': '',
        'token': $stateParams.token
    };
    $scope.isEmpty = true;
    $scope.isMatch = false;
    $scope.confirmPassword = '';
    $scope.result = {
        'success': false,
        'error': false
    };

    $scope.isEmptyFunc = function () {
        $scope.isEmpty = !$scope.recovery.email;
    };
    $scope.isMatchFunc = function () {
        $scope.isMatch = $scope.recovery.password == $scope.confirmPassword;
    };

    $scope.sendEmail = function () {

        $http.get($rootScope.contextPath + $rootScope.restPath + '/users/actions/sendLostPasswordToken?email='
                                                                                                + $scope.recovery.email)
            .success(function () {
                $scope.result.success = true;
            })
            .error(function () {
                $scope.result.error = true;
            });
    };

    $scope.sendNewPassword = function () {

        var sendData = {
            'token': $scope.recovery.token,
            'password': $scope.recovery.password
        };

        $http.put($rootScope.contextPath + $rootScope.restPath + '/users/actions/resetPassword', sendData)
            .success(function () {
                $scope.result.success = true;
                setTimeout(function () {
                    $rootScope.prevented = false;
                    $state.go('home');
                }, 3000);
            })
            .error(function (data) {
                console.log('error' + data);
            });

    };

});