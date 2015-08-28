app.directive('contentModel', function () {
    return function (scope, element, attr) {
        //element.bind('keypress', function () {
        //    updateModel()
        //});
        //element.bind('blur', function () {
        //    updateModel();
        //});
        //
        //function updateModel() {
        //    var model = attr['contentModel'];
        //    if (model.indexOf('.') === -1) {
        //        scope[model] = angular.element(element).html();
        //    } else {
        //        var split = model.split('.');
        //        // TODO fix split quantity problem
        //        scope[split[0]][split[1]] = angular.element(element).html();
        //    }
        //}
    }
});