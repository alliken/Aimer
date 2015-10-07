app.controller('draftsCtrl', function ($http, $compile, $rootScope, $scope, Drafts, Users, $sce, photoGrid, $timeout) {
    var draftsCtrl = this;
    var ang = angular.element;
    $scope.user = $rootScope.currentUser;
    draftsCtrl.noMoreDrafts = true;
    draftsCtrl.sortedDrafts = [];
    draftsCtrl.loading = false;
    draftsCtrl.busyDataLoading = false;
    draftsCtrl.addedPictures = [];

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

    draftsCtrl.uploadEditableAimPicture = function (file, aimIndex) {
        if (file) {
            insertPicture(file)
        } else {
            var imageInput = document.querySelector('.aim-feed .aim-picture' + aimIndex);
            imageInput.click();
            imageInput.onchange = function () {
                insertPicture()
            };
        }

        function insertPicture(file) {
            var editableAim = ang('.aim-feed .aim')[aimIndex];
            var uploadedImages = ang(editableAim).find('.aim-images img').length;
            var inputLength;
            var files;

            if (file) {
                inputLength = file.length;
                files = file;
            } else {
                inputLength = imageInput.files.length;
                files = imageInput.files;
            }

            if ((inputLength > 6) || (inputLength > (6 - uploadedImages))) {
                alert('Sorry, but you can\'t attach more than six images');
            } else if (inputLength === 0) {
                // do nothing
            } else {
                var i = 0;
                (function recursion() {
                    var reader = new FileReader();
                    if (i < inputLength) {
                        reader.onloadend = function () {

                            var idDate = new Date().getTime();
                            var toAppend = $compile(ang('<img class="image" data-id="' + idDate + '" src="'
                            + reader.result + '">'))($scope);
                            var container = ang(editableAim).find('.aim-images');
                            ang(container).append(toAppend);

                            draftsCtrl.addedPictures.push({file: files[i], id: idDate});

                            i++;

                            if (i === inputLength) {
                                photoGrid.apply(editableAim)
                            }

                            recursion();
                        };
                        reader.readAsDataURL(files[i]);
                    }
                })();

            }
        }
    };

    draftsCtrl.uploadEditableAimPictureDrag = function (aimIndex) {
        var file = $scope.uploadedFile;
        draftsCtrl.uploadEditableAimPicture(file, aimIndex)
    };

    draftsCtrl.deleteImage = function (e, aimIndex) {
        var editableAim = ang('.aim-feed .aim')[aimIndex];
        var target = e.target;
        var id = target.dataset.id;

        if (id) {
            for (var i = 0; i < draftsCtrl.addedPictures.length; i++) {
                if (draftsCtrl.addedPictures[i].id === id) {
                    draftsCtrl.addedPictures.splice(i, 1);
                }
            }
        } else {
            //var targetIndex = ang(e.target).index();
            var images = ang(editableAim).find('.aim-images img');
            var targetIndex = ang.inArray(e.target, images);

            draftsCtrl.sortedDrafts[aimIndex].aim.aimPictures.splice(targetIndex, 1);
        }

        ang(target).remove();
        photoGrid.apply(editableAim);
    };

    draftsCtrl.saveDraft = function (index) {
        var currentAim = draftsCtrl.sortedAims[index].aim;
        var steps = [];

        for (var i = 0; i < currentAim.steps.length; i++) {
            var currentStep = currentAim.steps[i];
            var subSteps = [];

            for (var j = 0; j < currentStep.subSteps.length; j++) {
                var currentSubStep = currentStep.subSteps[j];

                subSteps.push(new Step(
                    currentSubStep.id,
                    currentSubStep.title,
                    null, // TODO
                    null,
                    null, // TODO
                    null, // TODO
                    null,  // TODO
                    null));
            }

            steps.push(new Step(
                currentStep.id,
                currentStep.title,
                null, // TODO
                null,
                null, // TODO
                null, // TODO
                null, // TODO
                subSteps));
        }

        var description = function () {
            if (currentAim.description !== undefined) {
                return currentAim.description.toString();
            } else {
                return null;
            }
        };

        var aim = new Aim(
            currentAim.aimId,
            currentAim.title,
            description(),
            null,
            null,
            null,
            currentAim.commentsAccess,
            currentAim.access,
            steps);

        if (currentAim.aimPictures) {
            aim.aimPictures = [];
            for (i = 0; i < currentAim.aimPictures.length; i++) {
                aim.aimPictures.push({
                    pictureId: currentAim.aimPictures[i].pictureId,
                    picturePath: currentAim.aimPictures[i].picturePath
                });
            }
        }

        var data = new FormData();

        data.append('aimDto', JSON.stringify(aim));

        for (i = 0; i < loadAimsCtrl.addedPictures.length; i++) {
            data.append("photos", loadAimsCtrl.addedPictures[i].file);
        }

        $http({
            method: 'POST',
            url: $rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/update',
            headers: {'Content-Type': undefined},
            data: data,
            transformRequest: function (data) {
                return data;
            }
        })
            .success(function () {
                currentAim.isEditing = false;
                currentAim.steps = undefined;

                $timeout(function () {
                    var editableAim = ang('.aim-feed .aim')[index];
                    var aimName = ang(ang(editableAim).find('.aim-name')[0]);
                    var step = ang('.steps .step');

                    aimName
                        .attr({
                            'contenteditable': false
                        })
                        .removeClass('editable');
                    $compile(aimName)($scope);
                    loadAimsCtrl.isEditing = false;
                }, 1)
            })
            .error(function () {
                console.log('This aim doesn\'t exist or you don\'t have appropriate rights');
            });
    };

});