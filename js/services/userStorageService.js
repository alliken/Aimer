app.factory('userStorageService', ['$rootScope', '$http', '$q', '$location',
    function ($rootScope, $http, $q, $location) {
    return {
        contextPath: function () {
             $rootScope.contextPath = 'http://aimer.com.ua/aimer';
             $rootScope.restPath = '';
        },

        setCurrentUser: function (data) {
            $rootScope.currentUser = {
                'name': data.name,
                'email': data.email,
                'login': data.login,
                'userId': data.userId,
                'largePicture': $rootScope.contextPath + (data.largePicture ?
                    (data.largePicture + (data.largePicture.indexOf("?") > 0 ? "&" : "?") +
                    new Date().getTime()) : ('')),
                'smallPicture': $rootScope.contextPath + (data.smallPicture ?
                    (data.smallPicture + (data.smallPicture.indexOf("?") > 0 ? "&" : "?") +
                    new Date().getTime()) : ('')),
                'backgroundPicturePath': $rootScope.contextPath + data.backgroundPicturePath +
                '?' + new Date().getTime()
            };
            $rootScope.authenticated = true;
            //$rootScope.name = data.name;
            //$rootScope.email = data.email;
            //$rootScope.login = data.login;
            //$rootScope.userId = data.userId;
            //$rootScope.largePicture = $rootScope.contextPath + (data.largePicture ?
            //    (data.largePicture + (data.largePicture.indexOf("?") > 0 ? "&" : "?") +
            //    new Date().getTime()) : (''));
            //$rootScope.smallPicture = $rootScope.contextPath + (data.smallPicture ?
            //    (data.smallPicture + (data.smallPicture.indexOf("?") > 0 ? "&" : "?") +
            //    new Date().getTime()) : (''));
            //$rootScope.backgroundPicturePath = $rootScope.contextPath + data.backgroundPicturePath +
            //'?' + new Date().getTime();
        },

        setAnotherUser: function (data) {
            $rootScope.anotherUser = {
                'name': data.name,
                'email': data.email,
                'login': data.login,
                'userId': data.userId,
                'largePicture': $rootScope.contextPath + (data.largePicture ?
                    (data.largePicture + (data.largePicture.indexOf("?") > 0 ? "&" : "?") +
                    new Date().getTime()) : ('')),
                'smallPicture': $rootScope.contextPath + (data.smallPicture ?
                    (data.smallPicture + (data.smallPicture.indexOf("?") > 0 ? "&" : "?") +
                    new Date().getTime()) : ('')),
                'backgroundPicturePath': $rootScope.contextPath + data.backgroundPicturePath +
                '?' + new Date().getTime()
            }
        },

        getAnotherUser: function (login) {
            var defer = $q.defer(),
                self = this;
            $http.get($rootScope.contextPath + $rootScope.restPath + '/users/' + login + '?param=login')
                .success(function (data) {
                    self.setAnotherUser(data);
                    defer.resolve();
                })
                .error(function () {
                    $location.path('/components/error/404_not_found.html');
                    defer.reject();
                });
            return defer.promise;
        },
        getCurrentUser: function () {
            var defer = $q.defer(),
                self = this;

            $http.get($rootScope.contextPath + $rootScope.restPath +'/users', {headers: {}})
                .success(function (data) {
                    if (data.email) {
                        self.setCurrentUser(data);
                        defer.resolve(data);
                    } else {
                        defer.reject(data);
                    }
                });
            return defer.promise;
        }
    }
}]);