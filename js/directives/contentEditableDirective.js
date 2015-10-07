app.directive('contentEditable', function () {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            // view -> model
            element.bind('blur', function() {
                ngModel.$setViewValue(element.html());
            });

            //// model -> view
            ngModel.$render = function() {
                element.html(ngModel.$viewValue);
            };
        }
    };
});