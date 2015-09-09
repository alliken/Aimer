app.controller('loadAimsCtrl', function ($rootScope, $http, $sce, $timeout) {
    var loadAims = this;
    loadAims.sortedAims = [];
    loadAims.noMoreAims = false;
    loadAims.loading = false;
    loadAims.busyDataLoading = false;
    //var compareSorting = function (a, b) {
    //    if (a.dateOfAdding < b.dateOfAdding)
    //        return 1;
    //    if (a.dateOfAdding > b.dateOfAdding)
    //        return -1;
    //    return 0;
    //};

    var processAimObject = function (obj) {
        for (var i = 0; i < obj.length; i++) {
            var date = new Date(obj[i].dateOfAdding);
            obj[i].dateOfAdding = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            obj[i].title = $sce.trustAsHtml(obj[i].title);
            obj[i].description = $sce.trustAsHtml(obj[i].description);
        }
        return obj;
    };

    loadAims.getAims = function () {
        var offset;
        var limit;
        var userId;
        loadAims.loading = true;
        loadAims.busyDataLoading = true;

        if (loadAims.sortedAims.length === 0) {
            offset = 0;
            limit = 5;
        } else {
            offset = loadAims.sortedAims.length;
            limit = 5;
        }

        console.log('Offset: '+offset + ' '+ 'Limit: ' + limit);

        userId = $rootScope.anotherUser ? ('/' + $rootScope.anotherUser.userId) : '';
        $http.get($rootScope.contextPath + $rootScope.restPath + '/users' + userId + '/aims?offset=' +
        offset + '&limit=' + limit)
            .success(function (data) {
                if (data.length === 0) {
                    loadAims.loading = false;
                    loadAims.noMoreAims = true;
                    loadAims.busyDataLoading = true;
                } else {
                    //data = data.sort(compareSorting);
                    data = processAimObject(data);
                    console.log(data);
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
                    loadAims.sortedAims[index].likesCount = loadAims.sortedAims[index].likesCount - 1
                })
        } else {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/like')
                .success(function () {
                    loadAims.sortedAims[index].isUserLiked = true;
                    loadAims.sortedAims[index].likesCount = loadAims.sortedAims[index].likesCount + 1
                })
        }
    }
});
