// Lazy load JS
app.directive('head', function ($rootScope, $compile, $http) {
    return {
        restrict: 'E',
        link: function (scope, element) {
            $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState) {
                $rootScope.connectedCtrls = {};
                $rootScope.connectedCss = {};

                if (!fromState.name || (toState.data.css != fromState.data.css)) {

                    //angular.element('.hide-element').css('display', 'none');
                    angular.element('.lazyLoadedCss').html('');

                    if (toState.data.css && !$rootScope.connectedCss[toState.name]) {
                        $.ajaxSetup({
                            async: true
                        });
                        var arrCss = [];
                        !$.isArray(toState.data.css) ? (arrCss.push(toState.data.css)) : (arrCss = toState.data.css);
                        for (var k = 0; k < arrCss.length; k++) {

                            $http.get(arrCss[k])
                                .success(function (data) {
                                    var script = '<style class="lazyLoadedCss">' + data + '</style>';
                                    element.append($compile(script)(scope));
                                    $rootScope.connectedCss[toState.name] = true;
                                    if (k == (arrCss.length)) {
                                        $('.hide-element').css('display', 'block');
                                    }
                                });
                        }
                    } else {
                        $('.hide-element').css('display', 'block');
                    }
                } else {
                    $('.hide-element').css('display', 'block');
                }

                if (toState.data.js && !$rootScope.connectedCtrls[toState.controller]) {
                    $.ajaxSetup({
                        async: false
                    });
                    var arr = [];
                    !$.isArray(toState.data.js) ? (arr.push(toState.data.js)) : (arr = toState.data.js);
                    for (var j = 0; j < arr.length; j++) {
                        $.getScript(arr[j], function (data) {
                            var script = '<script>' + data + '</script>';
                            element.append($compile(script)(scope));
                            $rootScope.connectedCtrls[toState.controller] = true;
                        });
                    }
                }
            });
        }
    }
});