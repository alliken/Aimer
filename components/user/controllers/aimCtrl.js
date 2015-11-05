app.controller('aimCtrl', function ($scope, $rootScope, $http, $sce, $timeout, $location, Steps, Aims,
                                    $compile, $q, photoGrid, Comments, timeSyncServer) {
    var aimCtrl = this;
    var ang = angular.element;
    aimCtrl.isCommentsActive = false;
    aimCtrl.addedPictures = [];
    aimCtrl.isEditing = false;
    aimCtrl.aim = $scope.$parent.sortedAim;

    /**
     * Gets steps for current aim
     *
     * @returns {d.promise|Function|*|promise|string}
     */
    aimCtrl.getSteps = function (action) {
        var steps = aimCtrl.aim.steps;
        var aimId = aimCtrl.aim.aimId;

        if ((steps.length != 0) && !action) {
            aimCtrl.aim.steps = [];
            return;
        } else if ((steps.length != 0) && (action === 'editing')) {
            return;
        }

        var defer = $q.defer();


        Steps.getAimSteps(aimId).$promise.then(function (data) {
            steps.push.apply(steps, data);

            defer.resolve();
            if (data.length === 0) {
                defer.reject();
            }
        }, function () {
            console.log('Aim with this ID doesn\'t exist OR user is NOT authenticated');
            defer.reject();
        });
        return defer.promise;
    };

    /**
     * Likes and unlikes current aim
     */
    aimCtrl.likeAim = function () {
        var aim = aimCtrl.aim;
        var aimId = aim.aimId;
        var isLiked = aim.isUserLiked;

        if (isLiked) {
            Aims.unLikeAim(aimId).$promise.then(function (data) {
                aim.isUserLiked = false;
                aim.likesCount = data.likesCount;
                aim.repostCount = data.repostsCount;
            });
        } else {
            Aims.likeAim(aimId).$promise.then(function (data) {
                aim.isUserLiked = true;
                aim.likesCount = data.likesCount;
                aim.repostCount = data.repostsCount;
            })
        }
    };

    /**
     * Reposts and unreposts current aim
     */
    aimCtrl.repost = function () {
        var aim = aimCtrl.aim;

        if (!aim.userLogin || ($rootScope.currentUser.login === aim.userLogin)) return;

        var aimId = aim.aimId;
        var isReposted = aim.isUserReposted;

        if (isReposted) {
            Aims.unRepostAim(aimId).$promise.then(function (data) {
                aim.isUserReposted = false;
                aim.likesCount = data.likesCount;
                aim.repostCount = data.repostsCount;
            });
        } else {
            Aims.repostAim(aimId).$promise.then(function (data) {
                aim.isUserReposted = true;
                aim.likesCount = data.likesCount;
                aim.repostCount = data.repostsCount;
            });
        }
    };

    /**
     * Redirects to user page by login param
     *
     * @param login
     */
    aimCtrl.redirectToUser = function (login) {
        $location.path('/' + login);
    };

    /**
     * Changes class and contenteditable attr to editable elements
     */
    aimCtrl.editAim = function () {
        if (aimCtrl.isEditing) return;

        if (aimCtrl.aim.steps.length === 0) {
            aimCtrl.getSteps('editing').then(function () {
                aimCtrl.isEditing = true;
            });
        } else {
            aimCtrl.isEditing = true;
        }

    };

    /**
     * Moves dragged element to dropped place
     *
     * @param targetIndex
     * @param dragIndex
     */
    aimCtrl.onDropComplete = function (targetIndex, dragIndex) {
        var aim = aimCtrl.aim;
        Array.prototype.move = function (from, to) {
            this.splice(to, 0, this.splice(from, 1)[0]);
        };
        aim.steps.move(dragIndex, targetIndex);
    };

    /**
     * Adds new step
     */
    aimCtrl.addStep = function () {
        var step = new Step(null, '', null, null, null, null, null, null);
        var aim = aimCtrl.aim;
        aim.steps.push(step);
        aim.stepsCount = aim.stepsCount + 1;
    };

    /**
     * Removes step
     *
     * @param stepIndex - step index
     */
    aimCtrl.removeStep = function (stepIndex) {
        aimCtrl.aim.steps.splice(stepIndex, 1);
    };

    /**
     * Adds a substep into current step
     * @param pIndex
     * @param index
     */
    aimCtrl.addSubStep = function (pIndex, index) {
        var subStep = new Step(null, '', null, null, null, null, null, null);
        var steps = aimCtrl.aim.steps[index];
        if (!steps.subSteps) {
            steps.subSteps = [];
        }
        steps.subSteps.push(subStep);
    };

    /**
     * Removes subStep
     *
     * @param stepIndex
     * @param subStepIndex
     */
    aimCtrl.removeSubStep = function (stepIndex, subStepIndex) {
        aimCtrl.aim.steps[stepIndex].subSteps.splice(subStepIndex, 1);
    };

    aimCtrl.deleteImage = function (e, aimIndex) {
        if (!aimCtrl.isEditing) return;

        var editableAim = ang('.aim-feed .aim')[aimIndex];
        var target = e.target;
        var id = target.dataset.id;

        if (id) {
            for (var i = 0; i < aimCtrl.addedPictures.length; i++) {
                if (aimCtrl.addedPictures[i].id == id) {
                    aimCtrl.addedPictures.splice(i, 1);
                }
            }
        } else {
            var images = ang(editableAim).find('.aim-images img');
            var targetIndex = ang.inArray(e.target, images);

            aimCtrl.aim.aimPictures.splice(targetIndex, 1);
        }

        ang(target).remove();
        photoGrid.apply(editableAim);
    };

    aimCtrl.uploadEditableAimPicture = function (file, aimIndex) {
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

                            aimCtrl.addedPictures.push({file: files[i], id: idDate});

                            i++;

                            if (i === inputLength) {
                                //applyPhotoGrid(editableAim);
                                photoGrid.apply(editableAim);
                            }

                            recursion();
                        };
                        reader.readAsDataURL(files[i]);
                    }
                })();

            }
        }
    };

    aimCtrl.uploadEditableAimPictureDrag = function (aimIndex) {
        if (!aimCtrl.isEditing) return;

        var file = $scope.uploadedFile;
        aimCtrl.uploadEditableAimPicture(file, aimIndex)
    };

    /**
     * Saves edited aim
     */
    aimCtrl.saveAim = function () {
        var currentAim = aimCtrl.aim;
        var steps = [];

        for (var i = 0; i < currentAim.steps.length; i++) {
            var currentStep = currentAim.steps[i];
            var subSteps = [];

            if (currentStep.subSteps) {
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

        console.log(aimCtrl.addedPictures);

        for (i = 0; i < aimCtrl.addedPictures.length; i++) {
            data.append("photos", aimCtrl.addedPictures[i].file);
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
                currentAim.steps = [];

                aimCtrl.isEditing = false;
            })
            .error(function () {
                console.log('This aim doesn\'t exist or you don\'t have appropriate rights');
            });
    };

    /**
     * Loads comments to the current aim
     */
    aimCtrl.getComments = function () {
        var comments = $scope.$$childHead.commentsCtrl.comments;

        if (comments.length != 0) {
            $scope.$$childHead.commentsCtrl.comments = [];
            aimCtrl.aim.isCommentsActive = false;
            return;
        }

        var aimId = aimCtrl.aim.aimId;
        var offset = 0;
        var limit = 20;

        Comments.getComments(aimId, offset, limit).$promise.then(function (data) {
            if (data.length == 0 && aimCtrl.aim.isCommentsActive) {
                aimCtrl.aim.isCommentsActive = false;
                return;
            }
            for (var i = 0; i < data.length; i++) {
                data[i].isEditable = isCommentEditable(data[i].dateOfAdding);
                data[i].dateOfAdding = transformDateToReadable(data[i].dateOfAdding);
                data[i].userPicture = $rootScope.contextPath + (data[i].userPicture ?
                    (data[i].userPicture + (data[i].userPicture.indexOf("?") > 0 ? "&" : "?") +
                    new Date().getTime()) : (''));
            }
            $scope.$$childHead.commentsCtrl.comments = data;
            aimCtrl.aim.isCommentsActive = true;
        }, function () {
            aimCtrl.aim.isCommentsActive = true;
        });

        function isCommentEditable(dateOfAdding) {
            var date = new Date().getTime();
            return (date - dateOfAdding) <= timeSyncServer.commentEditingTime();
        }

        function transformDateToReadable(date) {
            var d = new Date(date);
            return ('0' + d.getDate()).slice(-2) + '/' +
                ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
        }
    }

    aimCtrl.finishStep = function (stepIndex) {
        aimCtrl.aim.steps[stepIndex].isDone = true;
    }
});