app.controller('draftCtrl', function ($http, $compile, $rootScope, $scope, Drafts, Users, $sce, photoGrid, $timeout,
                                      timeoutsService) {
    var draftsCtrl = this;
    var ang = angular.element;
    $scope.user = $rootScope.currentUser;
    draftsCtrl.noMoreDrafts = true;
    draftsCtrl.sortedDrafts = [];
    draftsCtrl.loading = false;
    draftsCtrl.busyDataLoading = false;
    draftsCtrl.addedPictures = [];
    draftsCtrl.draft = $scope.$parent.sortedDraft;
    draftsCtrl.isEditing = false;

    /**
     * Loads draft steps
     */
    (function getSteps() {
        var sessionObjectId = draftsCtrl.draft.sessionObjectId || null;
        var aimId = draftsCtrl.draft.aim.id || null;
        Drafts.getSteps(sessionObjectId, aimId).$promise.then(function (data) {
            draftsCtrl.draft.aim.steps = data;
            console.log(data);
        }, function () {
            console.log('bad');
        })
    }());

    /**
     * Collects draft data
     * @returns {{sessionObjectId: (*|null), aim: Aim}}
     */
    function collectDraftData () {
        var currentAim = draftsCtrl.draft.aim;
        var sessionObjectId = draftsCtrl.draft.sessionObjectId || null;

        function stepSet(currentAim) {
            var steps = [];

            for (var i = 0; i < currentAim.steps.length; i++) {
                var currentStep = currentAim.steps[i];

                if (currentStep.subSteps) {
                    var subSteps = subStepSet(currentStep);
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

            return steps;
        }

        function subStepSet(currentStep) {
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
            return subSteps
        }

        function description() {
            if (currentAim.description && (currentAim.description !== undefined)) {
                return currentAim.description.toString();
            } else {
                return null;
            }
        }

        return {
            'sessionObjectId': sessionObjectId,
            'aim': new Aim(
                currentAim.id || null,
                currentAim.title,
                description(),
                null,
                null,
                null,
                currentAim.commentsAccess,
                currentAim.access,
                stepSet(currentAim))
        };
    }

    /**
     * Makes draft fields contenteditable and sets timer to save drafts to session
     */
    draftsCtrl.editDraft = function () {
        draftsCtrl.isEditing = true;
        timeoutsService.draftEditingInterval.set(function () {
            var draft = collectDraftData();
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/putToSession',
                draft)
                .success(function (data) {
                    draftsCtrl.draft.sessionObjectId = data.sessionObjectId;
                })
        })
    };

    draftsCtrl.cancelEditing = function () {
        draftsCtrl.isEditing = false;
        timeoutsService.draftEditingInterval.cancel();
    };

    /**
     * Saves (finishes) draft
     * @param draftIndex
     * @param loadDraftsCtrl
     */
    draftsCtrl.saveDraft = function (draftIndex, loadDraftsCtrl) {
        var currentAim = draftsCtrl.draft.aim;
        var draft = collectDraftData();

        if (currentAim.aimPictures) {
            draft.aimPictures = [];
            for (i = 0; i < currentAim.aimPictures.length; i++) {
                draft.aimPictures.push({
                    pictureId: currentAim.aimPictures[i].pictureId,
                    picturePath: currentAim.aimPictures[i].picturePath
                });
            }
        }

        var data = new FormData();

        data.append('aimSessionDto', JSON.stringify(draft));

        for (var i = 0; i < draftsCtrl.addedPictures.length; i++) {
            data.append("photos", draftsCtrl.addedPictures[i].file);
        }

        $http({
            method: 'POST',
            url: $rootScope.contextPath + $rootScope.restPath + '/users/aims',
            headers: {'Content-Type': undefined},
            data: data,
            transformRequest: function (data) {
                return data;
            }
        })
            .success(function () {
                loadDraftsCtrl.sortedDrafts.splice(draftIndex, 1);
                timeoutsService.draftEditingInterval.cancel();
            })
            .error(function () {
                timeoutsService.draftEditingInterval.cancel();
                console.log('This aim doesn\'t exist or you don\'t have appropriate rights');
            });
    };

    /**
     * Moves dragged element to dropped place
     * @param targetIndex
     * @param dragIndex
     */
    draftsCtrl.onDropComplete = function (targetIndex, dragIndex) {
        var draft = draftsCtrl.draft.aim;
        Array.prototype.move = function (from, to) {
            this.splice(to, 0, this.splice(from, 1)[0]);
        };
        draft.steps.move(dragIndex, targetIndex);
    };

    /**
     * Removes step
     * @param stepIndex - step index
     */
    draftsCtrl.removeStep = function (stepIndex) {
        draftsCtrl.draft.aim.steps.splice(stepIndex, 1);
    };

    /**
     * Adds a substep into current step
     * @param pIndex
     * @param index
     */
    draftsCtrl.addSubStep = function (pIndex, index) {
        var subStep = new Step(null, '', null, null, null, null, null, null);
        var steps = draftsCtrl.draft.aim.steps[index];
        if (!steps.subSteps) {
            steps.subSteps = [];
        }
        steps.subSteps.push(subStep);
    };

    /**
     * Removes subStep
     * @param stepIndex
     * @param subStepIndex
     */
    draftsCtrl.removeSubStep = function (stepIndex, subStepIndex) {
        draftsCtrl.draft.aim.steps[stepIndex].subSteps.splice(subStepIndex, 1);
    };

    draftsCtrl.deleteImage = function (e, aimIndex) {
        if (!draftsCtrl.isEditing) return;

        var editableAim = ang('.aim-feed .aim')[aimIndex];
        var target = e.target;
        var id = target.dataset.id;

        if (id) {
            for (var i = 0; i < draftsCtrl.addedPictures.length; i++) {
                if (draftsCtrl.addedPictures[i].id == id) {
                    draftsCtrl.addedPictures.splice(i, 1);
                }
            }
        } else {
            var images = ang(editableAim).find('.aim-images img');
            var targetIndex = ang.inArray(e.target, images);

            draftsCtrl.draft.aim.aimPictures.splice(targetIndex, 1);
        }

        ang(target).remove();
        photoGrid.apply(editableAim);
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

    draftsCtrl.uploadEditableAimPictureDrag = function (aimIndex) {
        if (!draftsCtrl.isEditing) return;

        var file = $scope.uploadedFile;
        draftsCtrl.uploadEditableAimPicture(file, aimIndex)
    };

});