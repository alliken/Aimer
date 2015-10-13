app.service('Drafts', ['$resource', '$rootScope', '$http', function ($resource, $rootScope, $http) {
    var find = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/findDrafts', {});
    var del = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/deleteDraft', {}, {
        'delete': {method: 'DELETE'}
    });
    var steps = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/steps/actions/findDraftSteps', {},
        {
            'get': {method: 'GET', isArray: true}
        });

    return {
        getDrafts: function (limit) {
            return find.query({limit: limit});
        },
        deleteDraft: function (sessionId, aimId) {
            if (aimId && sessionId) {
                return del.delete({sessionObjectId: sessionId, aimId: aimId});
            } else if (aimId && !sessionId) {
                return del.delete({aimId: aimId});
            } else if (!aimId && sessionId) {
                return del.delete({sessionObjectId: sessionId});
            }
        },
        getSteps: function (sessionObjectId, aimId) {
            if (sessionObjectId) {
                return steps.get({sessionObjectId: sessionObjectId});
            } else {
                return steps.get({aimId: aimId});
            }
        }
    }
}]);