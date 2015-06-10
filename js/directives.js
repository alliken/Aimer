// Checks are passwords matches
app.directive('passwordMatch', function() {
    return {
        link: function (scope, element, attrs) {
            var data = scope[attrs['passwordMatch']];
            var name = attrs['name'];
            var c = 0;
            scope.signup.$invalid = true;
            scope.signup[name].$error.passwordMatch = true;
            scope.$watch(attrs.ngModel, function () {
                if (data.password == data[name]) {
                    scope.signup.confirmPassword.$invalid = false;
                    scope.signup[name].$error.passwordMatch = false;
                    (c == 0) ? (scope.signup.$invalid = true) : (scope.signup.$invalid = false);
                    c = 1;
                }
                else {
                    scope.signup[name].$error.passwordMatch = true;
                    scope.signup.$invalid = true;
                }

            });
        }}
});

// Shows error validation message only after input blur
app.directive('ngFocus', [function() {
    var FOCUS_CLASS = "ng-focused";
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$focused = false;
            element.bind('focus', function(evt) {
                element.addClass(FOCUS_CLASS);
                scope.$apply(function() {ctrl.$focused = true;});
            }).bind('blur', function(evt) {
                element.removeClass(FOCUS_CLASS);
                scope.$apply(function() {ctrl.$focused = false;});
            });
        }
    }
}]);