// NAVIGATION CONTROLLER
app.controller('navCtrl', function ($scope, $http, $rootScope, $location, $state, userStorageService) {
    $scope.user = $rootScope.currentUser;
    $scope.credentials = {};
    $scope.searchFriends = '';
    $scope.ishiddenDropDown = true;
    userStorageService.contextPath();


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

    //$('.info').popup();

    $('.navigation').text('');

    $(window).mouseup(function (e) {
        var container = $('.dropped');
        var dropButton = $('.drop-button');
        if ((!container.is(e.target) && !dropButton.is(e.target)) || container.is(':visible')) {
            container.hide();
        }
        else {
            container.show()
        }

    });

    $('.search-input').blur(function () {
        setTimeout(function () {
            $('.search-list').hide();
        }, 200);
    });
});