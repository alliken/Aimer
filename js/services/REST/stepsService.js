app.factory('Steps', ['$resource', '$rootScope', function ($resource, $rootScope) {

    var steps = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/steps', {});

    return {
        getAimSteps: function (aimId) {
            return steps.query({aimId: aimId});
        }
    }
}]);