app.controller('draftsCtrl', function ($http, $compile, $rootScope, $scope, Drafts, Users, $sce) {
    var draftsCtrl = this;
    var ang = angular.element;
    $scope.user = $rootScope.currentUser;
    draftsCtrl.noMoreDrafts = true;
    draftsCtrl.sortedDrafts = [];
    draftsCtrl.loading = false;
    draftsCtrl.busyDataLoading = false;

    /**
     * Loads left-aligned menu to user page
     */
    (function loadMenu() {
        var nav = ang('.navigation');
        nav.text('');
        if (nav.html() == "" || !nav.hasClass('user_menu') || nav.hasClass('settings_menu')) {
            $http.get($rootScope.contextPath + '/components/user/user_menu.html')
                .success(function (data) {
                    ang('.navigation').append($compile(data)($scope));
                    nav.addClass('user_menu');
                    nav.removeClass('settings_menu');

                    $(document).scroll(function () {
                        var y = $(this).scrollTop();
                        var parentWidth = $('.navigation').width();
                        if (y > 280) {
                            $('.scrolling-container').removeClass('unscrolled').addClass('scrolled')
                                .css('width', parentWidth + 3);
                        } else {
                            $('.scrolling-container').removeClass('scrolled').addClass('unscrolled');
                        }
                    });

                });
        }
    })();

    /**
     * Loads background html and sets
     */
    (function loadBackground() {
        var container = $('.background-container');

        container.text('');
        container.removeClass('loaded');

        if (!container.hasClass('loaded')) {
            $http.get($rootScope.contextPath + '/components/user/background.html')
                .success(function (data) {
                    ang('.background-container').append($compile(data)($scope));
                    container.addClass('loaded');
                });
        }
    })();

    /**
     * Gets current or another user following/followers quantity by id
     * @param id
     */
    (function getFollowingFollowers() {
        var id = $rootScope.anotherUser.userId || $rootScope.currentUser.userId;
        Users.getFollowingFollowers(id).$promise.then(function (data) {
            $scope.followingFollowers = {
                following: data.followingCount,
                followers: data.followersCount,
                aim: data.aimCount
            }
        }, function () {
            console.log('User doesn\'t exist');
        })
    })();

    /**
     * Processes and returns drafts array received from server
     *  1. Converts data from long type to DD/MM/YYYY
     *  2. Sanitizes draft title and converts it to string
     *  3. Sanitizes draft description
     *  4. Adds context path to profile picture path
     *
     * @param arr draft array
     * @returns arr processed object
     */
    var processDraftObject = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].toJSON();
            var date = new Date(arr[i].aim.dateOfAdding);
            arr[i].aim.dateOfAdding = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            arr[i].aim.title = $sce.trustAsHtml(arr[i].aim.title);
            arr[i].aim.title = arr[i].aim.title.toString();
            arr[i].aim.description = $sce.trustAsHtml(arr[i].aim.description);
            if (arr[i].aim.userProfilePicture) {
                arr[i].aim.userProfilePicture = $rootScope.contextPath + arr[i].aim.userProfilePicture;
            }
            arr[i].aim.steps = [];
        }
        return arr;
    };

    draftsCtrl.getDrafts = function () {
        var limit = 5;
        draftsCtrl.loading = true;
        draftsCtrl.busyDataLoading = true;

        Drafts.getDrafts(limit).$promise.then(function (data) {
            if (data.length === 0) {
                draftsCtrl.loading = false;
                draftsCtrl.noMoreAims = true;
                draftsCtrl.busyDataLoading = true;
            } else {
                console.log(data);
                data = processDraftObject(data);
                draftsCtrl.sortedDrafts.push.apply(draftsCtrl.sortedDrafts, data);

                draftsCtrl.loading = false;
                draftsCtrl.busyDataLoading = true;
            }
        });
    };

    /**
     * Deletes draft by sessionId
     * @param index
     */
    draftsCtrl.deleteDraft = function (index) {
        var sessionId = draftsCtrl.sortedDrafts[index].sessionObjectId || null;
        var aimId = draftsCtrl.sortedDrafts[index].aim.id || null;
        Drafts.deleteDraft(sessionId, aimId).$promise.then(function (data) {
            draftsCtrl.sortedDrafts.splice(index, 1);
        }, function () {
            console.log('bad');
        });
    };

});