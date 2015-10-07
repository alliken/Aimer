app.service('Drafts', ['$resource', '$rootScope', '$http', function ($resource, $rootScope, $http) {
    var find = $resource($rootScope.contextPath + $rootScope.restPath +
    '/users/aims/actions/findDrafts', {});
    var del = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/deleteDraft', {}, {
        'delete': {method: 'DELETE'}
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

            //$http.delete($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/deleteDraft',
            //    {sessionObjectId: sessionId, aimId: null})
            //    .success(function () {
            //        console.log('good')
            //    })
            //    .error(function () {
            //        console.log('bad')
            //    })
        }
    }
}]);