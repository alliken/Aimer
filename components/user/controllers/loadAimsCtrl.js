app.controller('loadAimsCtrl', function ($scope, $rootScope, $http, $sce, Aims) {
    var loadAimsCtrl = this;
    var ang = angular.element;
    loadAimsCtrl.noMoreAims = false;
    loadAimsCtrl.loading = false;
    loadAimsCtrl.busyDataLoading = false;
    loadAimsCtrl.sortedAims = [];

    /**
     * Processes and returns aims array received from server
     *  1. Converts data from long type to DD/MM/YYYY
     *  2. Sanitizes aim title and converts it to string
     *  3. Sanitizes aim description
     *  4. Adds context path to profile picture path
     *
     * @param arr aims array
     * @returns {obj} processed object
     */
    var processAimObject = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            var date = new Date(obj.dateOfAdding);
            obj.dateOfAdding = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            obj.title = $sce.trustAsHtml(arr[i].title);
            obj.title = arr[i].title.toString();
            obj.description = $sce.trustAsHtml(arr[i].description);
            if (obj.userProfilePicture) {
                arr[i].userProfilePicture = $rootScope.contextPath + arr[i].userProfilePicture;
            }
            obj.steps = [];
        }
        return arr;
    };

    loadAimsCtrl.getAims = function () {
        var offset;
        var userId;
        var limit = 5;
        var isDeleted = '?';
        loadAimsCtrl.loading = true;
        loadAimsCtrl.busyDataLoading = true;

        if (loadAimsCtrl.sortedAims.length === 0) {
            offset = 0;
        } else {
            offset = loadAimsCtrl.sortedAims.length;
        }

        if ($rootScope.currentUser && ($rootScope.anotherUser.userId === $rootScope.currentUser.userId)) {
            userId = '';
            isDeleted = '?isDeleted=false&'
        } else {
            userId = '/' + $rootScope.anotherUser.userId;
        }
        $http.get($rootScope.contextPath + $rootScope.restPath + '/users' + userId + '/aims' + isDeleted +
        'offset=' + offset + '&limit=' + limit)
            .success(function (data) {
                if (data.length === 0) {
                    loadAimsCtrl.loading = false;
                    loadAimsCtrl.noMoreAims = true;
                    loadAimsCtrl.busyDataLoading = true;
                } else {
                    data = processAimObject(data);
                    loadAimsCtrl.sortedAims.push.apply(loadAimsCtrl.sortedAims, data);
                    loadAimsCtrl.loading = false;
                    loadAimsCtrl.busyDataLoading = false;
                }
            })
    };

    /**
     * Deletes aim
     */
    loadAimsCtrl.deleteAim = function (aimId, index) {
        Aims.deleteAim(aimId).$promise.then(function () {
            loadAimsCtrl.sortedAims.splice(index, 1);
        }, function () {
            console.log('Deletion wasn\'t successful');
        })
    };

    /**
     * Gets canceled aim and inserts to aims Array
     *
     * @param aimId
     * @param aimIndex
     * @param aimCtrl
     */
    loadAimsCtrl.getCanceledAim = function (aimId, aimIndex, aimCtrl) {
        Aims.getAimById(aimId).$promise.then(function (data) {
            var aim = [data.toJSON()];
            var processedAim = processAimObject(aim);
            loadAimsCtrl.sortedAims[aimIndex] = processedAim[0];
            aimCtrl.isEditing = false;
        });
    }

});