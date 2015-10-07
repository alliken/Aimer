// NAVIGATION CONTROLLER
app.controller('navCtrl', function ($rootScope, $scope, $http, $location, $state, userStorageService) {
    $scope.user = $rootScope.currentUser;
    $scope.credentials = {};
    $scope.searchFriends = '';
    $scope.ishiddenDropDown = true;

    this.logout = function () {
        $http.post($rootScope.contextPath + $rootScope.restPath + '/logout', {}).success(function () {
            $rootScope.email = '';
            $rootScope.authenticated = false;
            $state.go('login');
        }).error(function () {
            $rootScope.email = '';
            $rootScope.authenticated = false;
            $state.go('login');
        });
    };

    // REDIRECT TO USER PAGE BY LOGIN
    this.redirectToUser = function (login) {
        $scope.searchFriends = "";
        $location.path('/' + login);
    };

    $('.navigation').text('');

    $(window).mouseup(function (e) {
        var container = [$('.dropped'), $('.dropdown-add-picture')];
        var dropButton = [$('.drop-button'), $('.aim-picture')];
        for (var i = 0; i < container.length; i++) {
            if ((!container[i].is(e.target) && !dropButton[i].is(e.target)) || container[i].is(':visible')) {
                container[i].hide();
            }
            else {
                container[i].show()
            }
        }

    });

    $('.search-input').blur(function () {
        setTimeout(function () {
            $('.search-list').hide();
        }, 200);
    });
});