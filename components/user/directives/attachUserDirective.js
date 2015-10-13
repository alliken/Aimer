// THIS DIRECTIVE LISTEN FOR CHARACTERS THAT USER TYPES AND TRIES TO CATCH @ SYMBOL
// WHEN @ IS CAUGHT  DIRECTIVE SEND REQUEST TO FIND RELATED USER

app.directive('attachUser', function ($rootScope, $http, $timeout) {
    return function (scope, element, attr) {
        var searchList = angular.element('.search-list-attach'); //search panel (list)
        element.bind('keypress', function (e) {
            var sel = window.getSelection(), // current caret selection
                position = sel.anchorOffset, // current caret position
                anchorNode = sel.anchorNode, // the node where cared is placed
                textValue = sel.anchorNode.nodeValue, // the value of a node where caret is placed
                aTag = '<a href="#" class="person just-added">@<span></span></a>&nbsp;',
                temporaryClassDot = '.just-added',
                temporaryClass = 'just-added';

            // if user typed @ symbol
            if (String.fromCharCode(e.which) == '@') {
                e.preventDefault();

                angular.element(temporaryClassDot).removeClass(temporaryClass);

                // If input element is empty - don't cut current textNode - just add link
                if (!angular.element(element).html()) {
                    angular.element(element).html(aTag);
                } else {
                    var firstPart = textValue.slice(0, position), // cut textNode in two parts
                        secondPart = textValue.slice(position);   // before (firstPart) @ and after (secondPart)
                    // replace textNode by A element and sliced parts of this node
                    angular.element(anchorNode).replaceWith(firstPart + ' ' + aTag + ' ' + secondPart);
                }
                moveCaret(temporaryClassDot);
                $rootScope.attachingStarted = true;
                return;
            }

            // It should be checked is parent node A to stop or not listening of user typing
            if (sel.anchorNode.parentNode.parentNode.nodeName == 'A') {
                angular.element(temporaryClassDot).removeClass(temporaryClass);
                angular.element(sel.anchorNode.parentNode.parentNode).addClass(temporaryClass);
                $rootScope.attachingStarted = true;
            }

            if ($rootScope.attachingStarted) {

                // if user typed space - stop listen
                if (String.fromCharCode(e.which) == ' ' || (angular.element(temporaryClassDot).length === 0)) {
                    $rootScope.attachingStarted = false;
                    angular.element(temporaryClassDot).removeClass(temporaryClass);
                    searchList.hide();
                    return;
                }

                // if caret placed at the end of span
                if (position == anchorNode.length) {
                    e.preventDefault();
                    if (angular.element(temporaryClassDot + ' span').length === 0) {
                        angular.element(temporaryClassDot).html('@<span></span>')
                    }
                    var span = angular.element(temporaryClassDot + ' span'),
                        person = span.html();
                    // insert typed character into span
                    span.html(person + String.fromCharCode(e.which));
                    moveCaret(temporaryClassDot + ' span');
                    search(person);
                }
            }

            // This function moves caret at the end of element that determines by SELECTOR parameter
            function moveCaret(selector) {
                var el = document.querySelector(selector),
                    range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(el, 1);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }

            function search(person) {
                var rect = element[0].getBoundingClientRect();
                var positionEl = $(element).offset();
                var positionMain = $('.aim-add').offset();
                var position = {
                    'top': (positionEl.top - positionMain.top) + rect.height - 1,
                    'left': positionEl.left - positionMain.left
                };

                $http.get($rootScope.contextPath + $rootScope.restPath + '/users/actions/search?searchString=' +
                person + '&type=all')
                    .success(function (data) {
                        if (data.length !== 0) {
                            // ng-repeat создает скоуп для каждого элемента, поэтому, когда мы применяем директиву
                            // в ng-repeat, она использует scope элемента ng-repeat'a
                            // TODO если в scope ng-repeat'a применить $parent, иначе - не применять
                            //scope.$parent.friends = data;

                            var level = attr.attachUser;
                            switch (level) {
                                case '1':
                                    scope.friends = data;
                                    break;
                                case '2':
                                    scope.$parent.friends = data;
                                    break;
                                case '3':
                                    scope.$parent.$parent.friends = data;
                                    break;
                            }

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
        element.bind('blur', function () {
            $timeout(function () {
                searchList.hide();
            }, 1000);
        });
        element.bind('click', function (e) {
            if (!angular.element(e.target).is('.just-added') && !angular.element(e.target).is('.just-added span')) {
                searchList.hide();
            }
        });

    }
});
