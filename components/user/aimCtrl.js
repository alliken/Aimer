app.controller('aimCtrl', function ($rootScope, $scope, $timeout, $interval, $http) {
    var aimCtrl = this,
        ang = angular.element,
        aim = {
            'markedUsers': ''
        };

    //Expand (show) aim add block
    aimCtrl.expandAddAim = function () {
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
        //$interval(function () {
        //    $http.put($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/putToSession',
        //        aimCtrl.collectAimData())
        //        .success(function (response) {
        //            console.log(response)
        //        })
        //}, 60000)
    };

    //Hide aim add block
    aimCtrl.hideAddAim = function () {
        $('html, body').animate({scrollTop: 0}, 400);
        $('.aim-add-button').show();
        $('.aim-add-form-container').hide();
        $scope.steps = [
            {
                'name': '',
                'description': ''
            }

        ];
    };

    aimCtrl.setAttachedUser = function (userId, login) {
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

    aimCtrl.newStep = function () {
        $scope.steps.push({})
    };

    aimCtrl.deleteStep = function () {
        if ($scope.steps.length > 1) {
            $scope.steps.pop();
        }
    };

    // STEP-PROPERTIES BUTTON FUNCTIONS....
    aimCtrl.addSubStep = function (index) {
        if (!$scope.steps[index].subStep) {
            $scope.steps[index].subStep = [{'name': ''}];
            return;
        }
        $scope.steps[index].subStep.push({});
    };
    aimCtrl.deleteSubStep = function (parentI, I) {
        $scope.steps[parentI].subStep.splice(I, 1)
    };
    aimCtrl.showDescription = function () {
        ang('.step-description').show();
    };
    aimCtrl.setDateTime = function (e, index) {
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

    aimCtrl.uploadAimPicture = function () {
        ang('.aim-picture').click();
    };

    /**
     * collectAimData() function collects AIM data including its steps, substeps
     * It calls by clicking "Save" button in aim-add block.
     * -----------------------VARIABLES------------------------
     * aimName - aim title (obligatory field)
     * aimDescription - aim description
     * access - type of access to this AIM (private, public, friends)
     * aimAttached - attached users to this AIM by @
     * -----------------------FUNCTIONS------------------------
     * getAimAttachedUsers() - get all users, attached to AIM
     * stepSet() - collect data from all AIM steps
     * subStepSet() - collect data from all steps substeps
     */
    aimCtrl.collectAimData = function () {
        // TODO Aim end and start, Step picture
        var aimName = ang('.aim-name .name').html() || null,
            aimDescription = tinyMCE.activeEditor.getContent() || null,
            access = $('.ui.dropdown').dropdown('get text') || null,
            aimAttached = [];

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
                    stepAttached, null, null,
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
                    ang(subStepSelector[i]).html(), null, null, null,
                    subStepAttached, null, null, null);
            }
            if (subSteps.length === 0) {
                return null;
            } else {
                return subSteps;
            }
        };

        var getAimData = new Aim(null,
            aimName,
            aimDescription, null, null,
            getAimAttachedUsers(), null, null,
            null,
            stepSet());

        console.log(getAimData);
        return getAimData;
    };

    aimCtrl.saveAim = function () {
        $http.post($rootScope.contextPath + $rootScope.restPath + '/users/aims?isDirty=true', aimCtrl.collectAimData())
            .success(function () {
                console.log('good');
            });
    };

    (function semanticUI() {
        $('.ui.dropdown')
            .dropdown();
    })();

});