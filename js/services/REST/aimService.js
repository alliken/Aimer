app.factory('Aims', ['$resource', '$rootScope', function ($resource, $rootScope) {

    var update = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/actions/update', {});
    var get = $resource($rootScope.contextPath + $rootScope.restPath + '/users/:userId/aims?offset=offset&limit=limit');
    var getById = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId', {}, {
        'get': {isArray: false}
    });
    var del = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:id', {}, {
        'delete': {
            method: 'PUT',
            params: {
                id: '@id',
                action: 'DELETE'
            }
        },
        'complete': {
            method: 'PUT',
            params: {
                id: '@id',
                action: 'COMPLETE'
            }
        }
    });

    return {
        updateAim: function (aim) {
            return update.save(aim)
        },
        getAimById: function (id) {
            return getById.get({aimId: id})
        },
        deleteAim: function (id) {
            return del.delete({id: id});
        },
        completeAim: function (id) {
            return del.complete({id: id})
        }
    }
}]);