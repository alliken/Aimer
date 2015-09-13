app.factory('followService', ['$rootScope', '$http', '$q', function ($rootScope, $http) {

    var checkIsFollowing = function (id) {
        if (id && (id !=$rootScope.currentUser.userId)) {
            $http.get($rootScope.contextPath + $rootScope.restPath + '/users/friends/' + id + '/actions/isSubscriber')
                .success(function (response) {
                    $rootScope.anotherUser.isFollowing = response;
                });
        }
    };

    var follow = function (id) {
        if (id != $rootScope.currentUser.userId) {
            $http.post($rootScope.contextPath + $rootScope.restPath + '/users/friends/' + id)
                .success(function () {
                    $rootScope.anotherUser.isFollowing = true;
                })
                .error(function (response) {
                    //TODO Inform user about email confirmation (u can't add unconfirmed user)
                });
        } else {
            $rootScope.anotherUser.isFollowing = false;
        }
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