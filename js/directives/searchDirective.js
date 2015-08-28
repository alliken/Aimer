app.directive('searchModel', function ($http, $rootScope) {
    return {
        link: function (scope) {
            scope.searchFriends = '';
            scope.$watch('searchFriends', function (newbie) {
                if (newbie.length > 2) {
                    $http.get($rootScope.contextPath + $rootScope.restPath + '/users/actions/search?searchString=' +
                                                                                                newbie + '&type=friends')
                        .success(function (data) {
                            if (data.length !== 0) {
                                scope.friends = data;
                                $('.search-list').fadeIn(150);
                                scope.searchError = false;
                            }
                            else {
                                $('.search-list').fadeIn(150);
                                scope.searchError = true;
                            }
                        })
                        .error(function () {
                            $('.search-list').fadeIn(150);
                            scope.searchError = true;
                        })
                }
                else if (newbie.length == 0) {
                    $('.search-list').hide();
                }

            }, true)
        }
    }

});