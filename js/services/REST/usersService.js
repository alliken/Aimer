app.factory('Users', ['$resource', '$rootScope', '$log', '$http', function ($resource, $rootScope, $log, $http) {
    return {
        user: function (param) {
            return $resource($rootScope.contextPath + $rootScope.restPath + '/users', {}, {
                'create': {method: 'POST'},
                'update': {method: 'PUT'},
                'delete': {method: 'DELETE'},
                'signin': {
                    method: 'GET',
                    headers: param
                }
            })
        },
        password: $resource($rootScope.contextPath + $rootScope.restPath + '/users/actions/changePassword', {}, {
            'change': {method: 'PUT'}
        }),
        email: $resource($rootScope.contextPath + $rootScope.restPath + '/users/actions/isEmailUnique', {}, {
            'isUnique': {method: 'GET'}
        }),
        getFollowingFollowers: function (id) {
            return  $resource($rootScope.contextPath + $rootScope.restPath +
            '/users/:id/actions/getAimAndFollowersCount', {}, {
                'get': { isArray: false }
            }).get({id: id});
        }
    }
}]);