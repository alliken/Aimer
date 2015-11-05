app.factory('Steps', ['$resource', '$rootScope', function ($resource, $rootScope) {

    var steps = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/steps', {}, {
        'get': {
            method: 'GET',
            params: {aimId: '@aimId', limit: 50, offset: 0},
            isArray: true
        }
    });

    return {
        getAimSteps: function (aimId) {
            return steps.get({aimId: aimId});
        }
    }
}]);