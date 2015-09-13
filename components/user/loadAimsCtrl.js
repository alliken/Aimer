app.controller('loadAimsCtrl', function ($rootScope, $http, $sce, $timeout, $location) {
    var loadAims = this;
    loadAims.sortedAims = [];
    loadAims.noMoreAims = false;
    loadAims.loading = false;
    loadAims.busyDataLoading = false;

    /**
     * Processes and returns aims array received from server
     *  1. Converts data from long type to DD/MM/YYYY
     *  2. Sanitizes aim title
     *  3. Sanitizes aim description
     *  4. Adds context path to profile picture path
     *
     * @param obj aims array
     * @returns {obj} processed object
     */
    var processAimObject = function (obj) {
        for (var i = 0; i < obj.length; i++) {
            var date = new Date(obj[i].dateOfAdding);
            obj[i].dateOfAdding = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            obj[i].title = $sce.trustAsHtml(obj[i].title);
            obj[i].description = $sce.trustAsHtml(obj[i].description);
            if (obj[i].userProfilePicture) {
                obj[i].userProfilePicture = $rootScope.contextPath + obj[i].userProfilePicture;
            }
        }
        return obj;
    };

    loadAims.getAims = function () {
        var offset;
        var userId;
        var limit = 5;
        loadAims.loading = true;
        loadAims.busyDataLoading = true;

        if (loadAims.sortedAims.length === 0) {
            offset = 0;
        } else {
            offset = loadAims.sortedAims.length;
        }

        userId = $rootScope.anotherUser ? ('/' + $rootScope.anotherUser.userId) : '';
        $http.get($rootScope.contextPath + $rootScope.restPath + '/users' + userId + '/aims?offset=' +
        offset + '&limit=' + limit)
            .success(function (data) {
                console.log(data);
                if (data.length === 0) {
                    loadAims.loading = false;
                    loadAims.noMoreAims = true;
                    loadAims.busyDataLoading = true;
                } else {
                    data = processAimObject(data);
                    loadAims.sortedAims.push.apply(loadAims.sortedAims, data);
                    loadAims.loading = false;
                    loadAims.busyDataLoading = false;
                }
            })
    };

    loadAims.likeAim = function (index) {
        var aimId = loadAims.sortedAims[index].aimId;
        var isLiked = loadAims.sortedAims[index].isUserLiked;
        if (isLiked) {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/unlike')
                .success(function () {
                    loadAims.sortedAims[index].isUserLiked = false;
                    loadAims.sortedAims[index].likesCount = loadAims.sortedAims[index].likesCount - 1;
                });
        } else {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/like')
                .success(function () {
                    loadAims.sortedAims[index].isUserLiked = true;
                    loadAims.sortedAims[index].likesCount = loadAims.sortedAims[index].likesCount + 1;
                });
        }
    };

    loadAims.repost = function (index) {
        var aimId = loadAims.sortedAims[index].aimId;
        var isReposted = loadAims.sortedAims[index].isUserReposted;

        if (isReposted) {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/unrepost')
                .success(function () {
                    loadAims.sortedAims[index].isUserReposted = false;
                    loadAims.sortedAims[index].repostCount = loadAims.sortedAims[index].repostCount - 1;
                });
        } else {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/repost')
                .success(function () {
                    loadAims.sortedAims[index].isUserReposted = true;
                    loadAims.sortedAims[index].repostCount = loadAims.sortedAims[index].repostCount + 1;
                });
        }

    };

    loadAims.redirectToUser = function (login) {
        $location.path('/' + login);
    };
});
