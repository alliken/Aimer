app.controller('loadAimsCtrl', function ($scope, $rootScope, $http, $sce, $timeout, $location, Steps, Aims,
                                         $compile, $q, photoGrid) {
    var loadAimsCtrl = this;
    var ang = angular.element;
    loadAimsCtrl.sortedAims = [];
    loadAimsCtrl.noMoreAims = false;
    loadAimsCtrl.loading = false;
    loadAimsCtrl.busyDataLoading = false;
    loadAimsCtrl.isEditing = false;
    loadAimsCtrl.addedPictures = [];

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
        loadAimsCtrl.loading = true;
        loadAimsCtrl.busyDataLoading = true;

        if (loadAimsCtrl.sortedAims.length === 0) {
            offset = 0;
        } else {
            offset = loadAimsCtrl.sortedAims.length;
        }

        userId = $rootScope.anotherUser ? ('/' + $rootScope.anotherUser.userId) : '';
        $http.get($rootScope.contextPath + $rootScope.restPath + '/users' + userId + '/aims?offset=' +
        offset + '&limit=' + limit)
            .success(function (data) {
                if (data.length === 0) {
                    loadAimsCtrl.loading = false;
                    loadAimsCtrl.noMoreAims = true;
                    loadAimsCtrl.busyDataLoading = true;
                } else {
                    data = processAimObject(data);
                    loadAimsCtrl.sortedAims.push.apply(loadAimsCtrl.sortedAims, data);
                    console.log(data);
                    loadAimsCtrl.loading = false;
                    loadAimsCtrl.busyDataLoading = false;
                }
            })
    };

    loadAimsCtrl.getSteps = function (index) {
        var editableAim = ang('.aim-feed .aim')[index];
        var step = ang(editableAim).find('.step');

        if (step.length != 0) {
            return;
        }

        var defer = $q.defer();
        var aimId = loadAimsCtrl.sortedAims[index].aimId;
        Steps.getAimSteps(aimId).$promise.then(function (data) {
            loadAimsCtrl.sortedAims[index].steps.push.apply(loadAimsCtrl.sortedAims[index].steps, data);
            defer.resolve();
            if (data.length === 0) {
                defer.reject();
            }
        }, function () {
            console.log('Aim with this ID DOESN\'T exist OR user is NOT authenticated');
            defer.reject();
        });
        return defer.promise;
    };

    loadAimsCtrl.likeAim = function (index) {
        var aimId = loadAimsCtrl.sortedAims[index].aimId;
        var isLiked = loadAimsCtrl.sortedAims[index].isUserLiked;
        if (isLiked) {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/unlike')
                .success(function (data) {
                    loadAimsCtrl.sortedAims[index].isUserLiked = false;
                    loadAimsCtrl.sortedAims[index].likesCount = data.likesCount;
                    loadAimsCtrl.sortedAims[index].repostCount = data.repostsCount;
                });
        } else {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/like')
                .success(function (data) {
                    loadAimsCtrl.sortedAims[index].isUserLiked = true;
                    loadAimsCtrl.sortedAims[index].likesCount = data.likesCount;
                    loadAimsCtrl.sortedAims[index].repostCount = data.repostsCount;
                });
        }
    };

    loadAimsCtrl.repost = function (index) {
        var aimId = loadAimsCtrl.sortedAims[index].aimId;
        var isReposted = loadAimsCtrl.sortedAims[index].isUserReposted;

        if (isReposted) {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/unrepost')
                .success(function () {
                    loadAimsCtrl.sortedAims[index].isUserReposted = false;
                    loadAimsCtrl.sortedAims[index].likesCount = data.likesCount;
                    loadAimsCtrl.sortedAims[index].repostCount = data.repostsCount;
                });
        } else {
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/' + aimId + '/actions/repost')
                .success(function () {
                    loadAimsCtrl.sortedAims[index].isUserReposted = true;
                    loadAimsCtrl.sortedAims[index].likesCount = data.likesCount;
                    loadAimsCtrl.sortedAims[index].repostCount = data.repostsCount;
                });
        }

    };

    loadAimsCtrl.redirectToUser = function (login) {
        $location.path('/' + login);
    };

    loadAimsCtrl.editAim = function (index) {
        if (loadAimsCtrl.isEditing) return;

        var editableAim = ang('.aim-feed .aim')[index];
        var aimName = ang(ang(editableAim).find('.aim-name')[0]);
        var step = ang('.steps .step');
        loadAimsCtrl.sortedAims[index].isEditing = true;

        aimName
            .attr({
                'content-editable': '',
                'contenteditable': true,
                'ng-model': 'loadAimsCtrl.sortedAims[' + index + '].title'
            })
            .addClass('editable');
        $compile(aimName)($scope);

        if (step.length === 0) {
            loadAimsCtrl.getSteps(index).then(function () {
                $timeout(function () {
                    editableAim = ang('.aim-feed .aim')[index];
                    aimName = ang(ang(editableAim).find('.aim-name')[0]);
                    step = ang('.steps .step');
                    console.log(step.length);
                    loadAimsCtrl.editAim(index);
                }, 1);
            });
            return;
        }
        loadAimsCtrl.isEditing = true;

        // Steps compiling
        for (var i = 0; i < step.length; i++) {
            var stepName = ang(step[i]).find('.step-name');
            var subSteps = ang(step[i]).find('.substep-name');

            ang(stepName)
                .attr({
                    'content-editable': '',
                    'contenteditable': true,
                    'ng-model': 'loadAimsCtrl.sortedAims[' + index + '].steps[' + i + '].title'
                })
                .addClass('editable');
            $compile(stepName)($scope);

            // Substeps compiling
            for (var j = 0; j < subSteps.length; j++) {
                var subStepName = subSteps[j];
                ang(subStepName)
                    .attr({
                        'content-editable': '',
                        'contenteditable': true,
                        'ng-model': 'loadAimsCtrl.sortedAims[' + index + '].steps[' + i + '].subSteps[' + j + '].title'
                    })
                    .addClass('editable-substep');
                $compile(subStepName)($scope);
            }
        }
    };

    loadAimsCtrl.deleteAim = function (index) {
        var id = loadAimsCtrl.sortedAims[index].aimId;
        console.log(id);
        Aims.deleteAim(id).$promise.then(function () {
            console.log('good');
        }, function () {
            console.log('bad');
        })
    };

    loadAimsCtrl.onDropComplete = function (targetIndex, dragIndex, event, pIndex) {
        var aim = loadAimsCtrl.sortedAims[pIndex];
        Array.prototype.move = function (from, to) {
            this.splice(to, 0, this.splice(from, 1)[0]);
        };
        aim.steps.move(dragIndex, targetIndex);

        $timeout(function () {
            addAttributes(targetIndex);
            addAttributes(dragIndex);

            function addAttributes(index) {
                var container = ang(ang('.drag-container')[index]);
                var subStepName = ang(container).find('.substep-name');
                for (var j = 0; j < subStepName.length; j++) {
                    ang(subStepName[j])
                        .attr({
                            'content-editable': '',
                            'contenteditable': true,
                            'ng-model': 'loadAimsCtrl.sortedAims[' + pIndex + ']' +
                            '.steps[' + index + '].subSteps[' + j + '].title'
                        })
                        .addClass('editable-substep');
                    $compile(subStepName)($scope);
                }
            }
        }, 1);

    };

    loadAimsCtrl.addStep = function (index) {
        var step = new Step(null, '', null, null, null, null, null, null);
        var aimObject = loadAimsCtrl.sortedAims[index];
        aimObject.steps.push(step);
        aimObject.stepsCount = aimObject.stepsCount + 1;

        $timeout(function () {
            var currentAim = ang('.aim-feed .aim')[index];
            var steps = ang(currentAim).find('.step');
            var stepName = ang(steps[steps.length - 1]).find('.step-name');
            ang(stepName)
                .attr({
                    'content-editable': '',
                    'contenteditable': true,
                    'ng-model': 'loadAimsCtrl.sortedAims[' + index + '].steps[' + (steps.length - 1) + '].title'
                })
                .addClass('editable');
            $compile(stepName)($scope);
            ang(stepName).focus();
        }, 1);
    };

    loadAimsCtrl.removeStep = function (pIndex, index) {
        loadAimsCtrl.sortedAims[pIndex].steps.splice(index, 1)
    };

    loadAimsCtrl.addSubStep = function (pIndex, index) {
        var subStep = new Step(null, '', null, null, null, null, null, null);
        var stepObject = loadAimsCtrl.sortedAims[pIndex].steps[index];
        if (!stepObject.subSteps) {
            stepObject.subSteps = [];
        }
        stepObject.subSteps.push(subStep);

        $timeout(function () {
            var currentAim = ang('.aim-feed .aim')[pIndex];
            var step = ang(currentAim).find('.step')[index];
            var subSteps = ang(step).find('.substep-name');
            var subStepName = subSteps[subSteps.length - 1];
            ang(subStepName)
                .attr({
                    'content-editable': '',
                    'contenteditable': true,
                    'ng-model': 'loadAimsCtrl.sortedAims[' + pIndex + ']' +
                    '.steps[' + index + '].subSteps[' + (subSteps.length - 1) + '].title'
                })
                .addClass('editable-substep');
            $compile(subStepName)($scope);
            ang(subStepName).focus();
        }, 1);
    };

    loadAimsCtrl.removeSubStep = function (ppIndex, pIndex, index) {
        loadAimsCtrl.sortedAims[ppIndex].steps[pIndex].subSteps.splice(index, 1)
    };

    loadAimsCtrl.deleteImage = function (e, aimIndex) {
        if (!loadAimsCtrl.sortedAims[aimIndex].isEditing) return;

        var editableAim = ang('.aim-feed .aim')[aimIndex];
        var target = e.target;
        var id = target.dataset.id;

        if (id) {
            for (var i = 0; i < loadAimsCtrl.addedPictures.length; i++) {
                if (loadAimsCtrl.addedPictures[i].id === id) {
                    loadAimsCtrl.addedPictures.splice(i, 1);
                }
            }
        } else {
            //var targetIndex = ang(e.target).index();
            var images = ang(editableAim).find('.aim-images img');
            var targetIndex = ang.inArray(e.target, images);

            loadAimsCtrl.sortedAims[aimIndex].aimPictures.splice(targetIndex, 1);
        }

        ang(target).remove();
        photoGrid.apply(editableAim);
    };

    loadAimsCtrl.uploadEditableAimPicture = function (file, aimIndex) {
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

                            loadAimsCtrl.addedPictures.push({file: files[i], id: idDate});

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

    loadAimsCtrl.uploadEditableAimPictureDrag = function (aimIndex) {
        var file = $scope.uploadedFile;
        loadAimsCtrl.uploadEditableAimPicture(file, aimIndex)
    };

    loadAimsCtrl.updateAim = function (index) {
        var currentAim = loadAimsCtrl.sortedAims[index];
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

    loadAimsCtrl.cancelAimEdit = function (index) {
        Aims.getAimById(loadAimsCtrl.sortedAims[index].aimId).$promise.then(function (data) {
            var aim = [data.toJSON()];
            var processedAim = processAimObject(aim);
            loadAimsCtrl.sortedAims[index] = processedAim[0];

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
        }, function () {
            console.log('This aim doesn\'t exist or you don\'t have appropriate rights');
        })
    };

});














