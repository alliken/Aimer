app.factory('authorization', ['$http', '$rootScope', '$location', 'userStorageService', 'followService', '$state',
    function ($http, $rootScope, $location, userStorageService, followService, $state) {
        return {
            authorize: function ($stateParams, st) {
                if (!$stateParams) $stateParams = {user: ""};
                if (!$rootScope.authenticated) {
                    userStorageService.getCurrentUser()
                        .then(function () { // SUCCESS
                            if ($stateParams.user && ($stateParams.user !== $rootScope.login)) {
                                userStorageService.getAnotherUser($stateParams.user)
                                    .then(function () {
                                        followService.checkIsFollowing($rootScope.anotherUser.userId);
                                    });
                            }
                            else {
                                $rootScope.anotherUser = false;
                                if (st == 'home') {
                                    $location.path('/' + $rootScope.login);
                                }
                            }
                        }, function () { // ERROR
                            if ($stateParams.user) {
                                userStorageService.getAnotherUser($stateParams.user);
                            } else {
                                //$location.path('/login');

                                if (st != 'login') $state.go('login');
                            }
                        });
                } else {
                    if ($stateParams.user && ($stateParams.user !== $rootScope.login)) {
                        userStorageService.getAnotherUser($stateParams.user)
                            .then(function () {
                                followService.checkIsFollowing($rootScope.anotherUser.userId);
                            });
                    }
                    else {
                        $rootScope.anotherUser = false;
                    }
                }
            }
        }
    }]);

