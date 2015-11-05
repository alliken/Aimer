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
    var like = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/actions/like', {}, {
        'put': {
            method: 'PUT',
            params: {aimId: '@aimId'}
        }
    });
    var unlike = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/actions/unlike', {}, {
        'put': {
            method: 'PUT',
            params: {aimId: '@aimId'}
        }
    });
    var repost = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/actions/repost', {}, {
        'put': {
            method: 'PUT',
            params: {aimId: '@aimId'}
        }
    });
    var unRepost = $resource($rootScope.contextPath + $rootScope.restPath + '/users/aims/:aimId/actions/unrepost', {}, {
        'put': {
            method: 'PUT',
            params: {aimId: '@aimId'}
        }
    });

    return {
        updateAim: function (aim) {
            return update.save(aim);
        },
        getAimById: function (id) {
            return getById.get({aimId: id});
        },
        deleteAim: function (id) {
            return del.delete({id: id});
        },
        completeAim: function (id) {
            return del.complete({id: id});
        },
        likeAim: function (aimId) {
            return like.put({aimId: aimId});
        },
        unLikeAim: function (aimId) {
            return unlike.put({aimId: aimId});
        },
        repostAim: function (aimId) {
            return repost.put({aimId: aimId});
        },
        unRepostAim: function (aimId) {
            return unRepost.put({aimId: aimId});
        }
    }
}]);