app.factory('followService', ['$rootScope', '$http', '$q', function ($rootScope, $http) {

    var checkIsFollowing = function (id) {
        $http.get($rootScope.contextPath + $rootScope.restPath + '/users/friends/' + id + '/actions/isSubscriber')
            .success(function (response) {
                $rootScope.anotherUser.isFollowing = response;
            });
    };

    var follow = function (id) {
        $http.post($rootScope.contextPath + $rootScope.restPath + '/users/friends/' + id)
            .success(function () {
                $rootScope.anotherUser.isFollowing = true;
            })
            .error(function (response) {
                //TODO Inform user about email confirmation (u can't add unconfirmed user)
            });
    };

    var unFollow = function (id) {
        $http.delete($rootScope.contextPath + $rootScope.restPath + '/users/friends/' + id)
            .success(function () {
                $rootScope.anotherUser.isFollowing = false;
            });
    };

    return {
        checkIsFollowing: checkIsFollowing,
        follow: follow,
        unFollow: unFollow
    };
}]);