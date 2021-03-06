app.controller('aimAddCtrl', function ($rootScope, $scope, $timeout, $interval, $http, $compile, Aims, processAim,
                                       timeoutsService, photoGrid) {
    var aimAddCtrl = this;
    var ang = angular.element;
    //var masonryGrid = undefined;
    aimAddCtrl.sessionId = null;
    aimAddCtrl.aim = {
        'pictures': []
    };

    /**
     * Expands aim add block with window scroll animation.
     * Initializes TinyMCE plugin and sets time interval for drafts updating
     */
    aimAddCtrl.expandAddAim = function () {
        $('html, body').animate({scrollTop: 300}, 150);
        $('.aim-add-button').hide();
        $('.aim-add-form-container').show();
        tinymce.init({
            selector: ".aim-textarea",
            plugins: [
                "link"
            ],
            statusbar: false,
            menubar: false,
            toolbar: "undo redo | bold italic code | bullist numlist | link | mybutton ",
            height: 200,
            width: 612,
            resize: false,
            setup: function (ed) {
                // Add a custom button
                ed.on('keypress', function (e) {
                    var searchList = ang('.search-list-attach'), // search panel (list)
                        aTag = '<a href="#" class="person just-added">@<span></span></a>&nbsp;',
                        temporaryClassDot = '.just-added',
                        temporaryClass = 'just-added',
                        temporarySpan = temporaryClassDot + ' span',
                        tmce = {
                            selectElement: function (selector) {
                                // select dom element
                                return tinyMCE.activeEditor.dom.select(selector);
                            },
                            moveCaret: function (selector) {
                                //move caret at the end of selected element
                                tinyMCE.activeEditor.selection.select(tmce.selectElement(selector)[0], true);
                                tinyMCE.activeEditor.selection.collapse(false);
                            },
                            changeContent: function (selector, content) {
                                // change content of dom element
                                tinyMCE.activeEditor.dom.setHTML(tmce.selectElement(selector), content);
                            },
                            getContent: function (selector) {
                                if (tmce.selectElement(selector).length == 0) {
                                    return null;
                                } else {
                                    return tmce.selectElement(selector)[0].innerHTML;
                                }
                            },
                            getCursorPosition: function () {
                                return ed.selection.getRng().startOffset;
                            },
                            removeClass: function (selector, className) {
                                tinyMCE.activeEditor.dom.removeClass(tmce.selectElement(selector), className);
                            },
                            selectQuery: function (selector) {
                                var q = tinymce.dom.DomQuery;
                                return q(selector);
                            }
                        };

                    // if user typed @ symbol
                    if (String.fromCharCode(e.which) == '@') {
                        e.preventDefault();

                        tmce.removeClass(temporaryClassDot, temporaryClass);

                        // If input element is empty don't cut current textNode - just add link
                        if (!tinyMCE.activeEditor.getContent()) {
                            tinyMCE.activeEditor.setContent(aTag);
                        } else {
                            var currentNode = ed.selection.getRng(),
                                position = currentNode.startOffset,
                                textValue = currentNode.startContainer.nodeValue,
                                firstPart = textValue.slice(0, position),
                                secondPart = textValue.slice(position);
                            tmce.selectQuery(currentNode.startContainer)
                                .replaceWith(firstPart + ' ' + aTag + ' ' + secondPart);
                        }
                        tmce.moveCaret(temporaryClassDot);
                        $rootScope.attachingStarted = true;
                        return;
                    }

                    //It should be checked is parent node A to stop or not listening of user typing
                    if (ed.selection.getRng().startContainer.parentNode.parentNode.nodeName == 'A') {
                        tmce.removeClass(temporaryClassDot, temporaryClass);
                        tmce.selectQuery(ed.selection.getRng().startContainer.parentNode.parentNode)
                            .addClass(temporaryClass);
                        $rootScope.attachingStarted = true;
                    }

                    if ($rootScope.attachingStarted) {
                        // if user typed space - stop listen
                        if (String.fromCharCode(e.which) == ' ' || (tmce.selectElement(temporaryClassDot).length === 0)) {
                            $rootScope.attachingStarted = false;
                            tmce.removeClass(temporaryClassDot, temporaryClass);
                            searchList.hide();
                            return;
                        }

                        // if caret placed at the end of span
                        if ((tmce.getContent(temporarySpan) === null) ||
                            (tmce.getCursorPosition() == tmce.getContent(temporarySpan).length) ||
                            ((tmce.getCursorPosition() == 1) && (tmce.getContent(temporarySpan).length == 0))) {
                            e.preventDefault();
                            if (tmce.selectElement(temporarySpan).length === 0) {
                                tmce.changeContent(temporaryClassDot,
                                    '@<span>' + String.fromCharCode(e.which) + '</span>');
                            } else {
                                var spanContent = tmce.getContent(temporarySpan);
                                tmce.changeContent(temporarySpan,
                                    spanContent + String.fromCharCode(e.which));
                                var person = tmce.getContent(temporarySpan);
                            }
                            tmce.moveCaret(temporarySpan);
                        }
                        search(person);

                    }

                    function search(person) {
                        var iframe = document.getElementById("content_ifr"),
                            searchList = ang('.search-list-attach'),
                            iframe_content = iframe.contentDocument,
                            body = iframe_content.body,
                            link = iframe_content.querySelector(temporaryClassDot),
                            iframeOffset = $(iframe).offset(),
                            bodyOffset = $(body).offset(),
                            linkOffset = $(link).offset(),
                            positionMain = $('.aim-add').offset(),
                            linkHeight = link.getBoundingClientRect().height,
                            position = {
                                'top': iframeOffset.top + bodyOffset.top + linkOffset.top +
                                (linkHeight / 2) - positionMain.top,
                                'left': iframeOffset.left + linkOffset.left - positionMain.left
                            };

                        $http.get($rootScope.contextPath + $rootScope.restPath + '/users/actions/search?searchString=' +
                        person + '&type=all')
                            .success(function (data) {
                                if (data.length !== 0) {
                                    $scope.friends = data;
                                    searchList.css({
                                        'top': position.top,
                                        'left': position.left
                                    });
                                    searchList.show();
                                }
                                else {
                                    searchList.hide();
                                }
                            })
                    }
                });
                ed.addButton('mybutton', {
                    title: 'Code format',
                    icon: 'code',
                    onclick: function () {
                        // Add you own code to execute something on click
                        ed.focus();
                        ed.selection.setContent('<code>' + ed.selection.getContent() + '</code>');
                    }
                });

            }
        });

        timeoutsService.aimEditingInterval.set(function () {
            var aim = aimAddCtrl.collectAimData(aimAddCtrl.sessionId);
            $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/putToSession',
                aim)
                .success(function (data) {
                    aimAddCtrl.sessionId = data.sessionObjectId;
                })
        });
    };

    //Hide aim add block
    aimAddCtrl.hideAddAim = function () {
        timeoutsService.aimEditingInterval.cancel()
        aimAddCtrl.sessionId = null;
        $('html, body').animate({scrollTop: 0}, 400);
        $('.aim-add-button').show();
        $('.aim-add-form-container').hide();
    };

    aimAddCtrl.setAttachedUser = function (userId, login) {
        if (ang('.just-added').length == 0) {
            var iframe = document.getElementById("content_ifr").contentDocument;
            ang(iframe.querySelector('.just-added'))
                .attr('ng-click', 'nav.redirectToUser(' + userId + ')')
                .attr('data-user', userId)
                .html('@<span>' + login + '</span>')
                .removeClass('just-added');
        } else {
            ang('.just-added')
                .attr('ng-click', 'nav.redirectToUser(' + userId + ')')
                .attr('data-user', userId)
                .html('@<span>' + login + '</span>');
            moveCaret('.just-added');
            ang('.just-added').removeClass('just-added');
        }
        ang('.search-list-attach').hide();
        $rootScope.attachingStarted = false;

        function moveCaret(selector) {
            var el = document.querySelector(selector).nextSibling,
                range = document.createRange(),
                sel = window.getSelection();
            range.setStart(el, 1);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    aimAddCtrl.newStep = function () {
        $scope.steps.push({})
    };

    aimAddCtrl.deleteStep = function () {
        //if ($scope.steps.length > 1) {
        $scope.steps.pop();
        //}
    };

    // STEP-PROPERTIES BUTTON FUNCTIONS....
    aimAddCtrl.addSubStep = function (index) {
        if (!$scope.steps[index].subStep) {
            $scope.steps[index].subStep = [{'name': ''}];
            return;
        }
        $scope.steps[index].subStep.push({});
    };
    aimAddCtrl.deleteSubStep = function (parentIndex, index) {
        $scope.steps[parentIndex].subStep.splice(index, 1)
    };
    aimAddCtrl.showDescription = function () {
        ang('.step-description').show();
    };
    aimAddCtrl.setDateTime = function (e, index) {
        ang(e.target).hide();
        ang(e.target).parent().find('.date').show();
        $("#dtBox" + index).DateTimePicker({
            parentElement: "#startGroup" + index
        });
        $("#dt2Box" + index).DateTimePicker({
            parentElement: "#endGroup" + index
        });
    };
    //.... END OF STEP-PROPERTIES BUTTON FUNCTIONS

    /**
     * Uploads not more than six pictures chosen by user to UI and
     * adds such to an object
     *
     * @var imageInput - file input
     * @var inputLength - uploaded file quantity
     * @var files - uploaded files
     * @var uploadedImages - images quantity, uploaded to the DOM
     *
     * @function recursion - uploads loaded in imageInput images to the DOM
     */
    aimAddCtrl.uploadAimPicture = function (file) {
        if (file) {
            insertPicture(file)
        } else {
            var imageInput = document.querySelector('.aim-picture');
            imageInput.click();
            imageInput.onchange = function () {
                insertPicture()
            };
        }

        function insertPicture(file) {
            var uploadedImages = ang('.aim-images-preview .image-container').length;
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
                ang('.aim-images-preview').css('display', 'inline-block');
                var i = 0;
                (function recursion() {
                    var imgContainerWrap = ang('.aim-images-preview'),
                        reader = new FileReader();
                    if (i < inputLength) {
                        reader.onloadend = function () {
                            var toAppend = $compile(ang('<img src="' + reader.result + '">'))
                            ($scope);

                            //'<div class="remove-icon-container" ng-click="aimAddCtrl.closeUploadedPicture($event)">' +
                            //'<i class="remove icon"></i></div>

                            aimAddCtrl.aim.pictures.push(files[i]);

                            ang(imgContainerWrap).append(toAppend);

                            i++;

                            if (i === inputLength) {
                                photoGrid.apply('.aim-add', '.aim-images-preview');
                            }

                            recursion();
                        };
                        reader.readAsDataURL(files[i]);
                    }
                })();
            }
        }
    };

    aimAddCtrl.uploadAimPictureDrag = function () {
        var file = $scope.uploadedFile;
        aimAddCtrl.uploadAimPicture(file)
    };

    aimAddCtrl.dropDown = function () {
        if (ang('.dropdown-add-picture').is(":visible")) {
            ang('.dropdown-add-picture').hide();
        } else {
            ang('.dropdown-add-picture').show();
        }
    };

    aimAddCtrl.showDragAndDropField = function () {
        ang('.aim-images-preview').css('display', 'inline-block');
    };

    /**
     *  Closes uploaded image to aim and deletes it from an object
     *
     * @function deletePicture()
     *  deletes image by index in parent object,
     *  animates it and removes image element from DOM
     *
     * @param e
     *  an click event
     */
    aimAddCtrl.deleteImage = function (e) {
        if (e.target.nodeName != 'IMG') {
            return;
        }

        var targetImage = ang(e.target);
        var index = ang(ang(targetImage.parent()).find('img')).index(e.target);

        aimAddCtrl.aim.pictures.splice(index, 1);

        targetImage.remove();
        photoGrid.apply('.aim-add', '.aim-images-preview');
    };

    /**
     * Function collects AIM data including its steps, substeps
     * and calls by clicking "Save" button in aim-add block.
     *
     * @var aimName - aim title (obligatory field)
     * @var aimDescription - aim description
     * @var access - type of access to this AIM (private, public, friends)
     * @var aimAttached - attached users to this AIM by @
     *
     * @function getAimAttachedUsers() - get all users, attached to AIM
     * @function stepSet() - collect data from all AIM steps
     * @function subStepSet() - collect data from all steps substeps
     */
    aimAddCtrl.collectAimData = function (session) {
        var aimName = ang('.aim-name .name').html() || null;
        var aimDescription = tinyMCE.activeEditor.getContent() || null;
        var access = $('.ui.dropdown').dropdown('get text') || null;
        var aimAttached = [];

        if (aimName === null) return;

        function getAimAttachedUsers() {
            var tagsName = $('.aim-name .name').find('.person') || null,
                tagsDescription = $(aimDescription).find('.person') || null,
                aimAttached = null;

            if (tagsDescription === null && tagsName === null) {
                return;
            }

            if (tagsDescription != null) {
                for (var i = 0; i < tagsDescription.length; i++) {
                    aimAttached.push($(tagsDescription[i]).data('user'));
                }
            }
            if (tagsName != null) {
                for (var i = 0; i < tagsName.length; i++) {
                    aimAttached.push($(tagsName[i]).data('user'));
                }
            }

            return aimAttached;
        }

        var stepSet = function () {
            var steps = [],
                stepAttached = null,
                stepNameSelector = ang('.aim-step .step-name'),
                stepDescriptionSelector = ang('.aim-step .step-description'),
                stepStartDateSelector = ang('.aim-step .start-date');

            for (var i = 0; i < stepNameSelector.length; i++) {
                var name = ang(stepNameSelector[i]).html() || null,
                    description = ang(stepDescriptionSelector[i]).html() || null,
                    subSteps = subStepSet(i) || null,
                    startDate = ang(stepStartDateSelector[i]) || null,
                    tagsName = $(stepNameSelector[i]).find('.person') || null,
                    tagsDescription = $(stepDescriptionSelector[i]).find('.person') || null;

                if (tagsDescription === null && tagsName === null) {
                    stepAttached = null;
                    return;
                }

                if (tagsDescription != null) {
                    for (var k = 0; k < tagsDescription.length; k++) {
                        stepAttached.push($(tagsDescription[k]).data('user'));
                    }
                }
                if (tagsName != null) {
                    for (var k = 0; k < tagsName.length; k++) {
                        stepAttached.push($(tagsName[k]).data('user'));
                    }
                }

                steps[i] = new Step(null,
                    name,
                    description, null, null,
                    stepAttached, null,
                    subSteps);
            }
            return steps;
        };

        var subStepSet = function (i) {
            var subSteps = [],
                subStepAttached = null,
                containerSelector = ang('.aim-step .step-container')[i],
                subStepSelector = ang(containerSelector).find('.subStep-name');

            for (var j = 0; j < subStepSelector.length; j++) {
                var tagsName = $(subStepSelector[j]).find('.person') || null;

                if (tagsName === null) {
                    subStepAttached = null;
                    return;
                }

                if (tagsName != null) {
                    for (var k = 0; k < tagsName.length; k++) {
                        subStepAttached.push($(tagsName[k]).data('user'));
                    }
                }

                subSteps[j] = new Step(null,
                    ang(subStepSelector[j]).html(), null, null, null,
                    subStepAttached, null, null);
            }
            if (subSteps.length === 0) {
                return null;
            } else {
                return subSteps;
            }
        };

        return {
            "sessionObjectId": session,
            "aim": new Aim(null,
                aimName,
                aimDescription, null, null,
                getAimAttachedUsers(), null,
                null,
                stepSet())
        };
    };

    aimAddCtrl.saveAim = function () {
        var data = new FormData();
        var aim = aimAddCtrl.collectAimData(aimAddCtrl.sessionId);
        for (var i = 0; i < aimAddCtrl.aim.pictures.length; i++) {
            data.append("photos", aimAddCtrl.aim.pictures[i]);
        }

        console.log(aimAddCtrl.aim.pictures)

        data.append('aimSessionDto', JSON.stringify(aim));

        console.log($scope);

        $http({
            method: 'POST',
            url: $rootScope.contextPath + $rootScope.restPath + '/users/aims',
            headers: {'Content-Type': undefined},
            data: data,
            transformRequest: function (data) {
                return data;
            }
        })
            .success(function (data) {
                aimAddCtrl.sessionId = null;
                aimAddCtrl.hideAddAim();
                timeoutsService.aimEditingInterval.cancel();

                Aims.getAimById(data.aimId).$promise.then(function (aim) {
                    var arr = [aim];
                    aim = processAim(arr);
                    var loadAimsCtrl = $scope.$$nextSibling.loadAimsCtrl;
                    loadAimsCtrl.sortedAims.unshift(aim[0]);
                });
            });


    };

    (function semanticUI() {

        // Public/private/friends dropdown
        ang('.ui.dropdown')
            .dropdown();
    })();

});