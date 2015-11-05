//SETTINGS CONTROLLER
app.lazy.controller('settingsCtrl', function ($scope, $http, $rootScope, $compile, $state, Users) {
    var ang = angular.element;
    $scope.user = $rootScope.currentUser;
    $scope.unique = true;

    // UPDATE USER INFORMATION
    $scope.updateInfo = function () {
        if (!$scope.update.$invalid && $scope.unique) {
            var users = new User();
            users.userId = $rootScope.userId;
            users.name = $scope.user.name;
            users.login = $scope.user.login;
            users.email = $scope.user.email.toLowerCase();

            $rootScope.currentUser.login = $scope.user.login;

            Users.user().update({}, users, function () {
                ang('.save').removeClass('blue').addClass('green').html('<i class="checkmark icon"></i>Saved');
            });

        }
    };

    // UPDATE USER PASSWORD
    $scope.updatePassword = function (valid) {
        $('.warning').css('display', 'none');
        if (!valid && ($scope.user.password === $scope.user.confirmPassword) && $scope.user.oldPassword) {
            $scope.password = {
                'oldPassword': $scope.user.oldPassword,
                'newPassword': $scope.user.password
            };

            Users.password.change({}, $scope.password, function () {
                ang('.save').removeClass('blue').addClass('green').html('<i class="checkmark icon"></i>Saved');
            }, function (data) {
                if (data.data.statusCode == 'PasswordMatchingException') {
                    ang('.warning').css('display', 'block');
                }
            });
        }
    };

    // CHECK LOGIN/EMAIL UNIQUENESS
    $scope.isUnique = function ($event, valid) {

        var param = angular.element($event.currentTarget).attr('name');
        var value = {};
        var message = $('.not-unique-' + param + '-message');
        var good = $('.not-unique-' + param + '-good');
        var alreadyExist = $('.not-unique-' + param);

        setTimeout(function () {
            if (!valid) {
                value[param] = $scope.user[param];
                if ($scope.user[param] !== $rootScope[param]) {
                    param = param.toLowerCase();
                    //    .replace(/\b[a-z]/g, function (letter) {
                    //    return letter.toUpperCase();
                    //});

                    //Users[param].isUnique(value, function (data) {
                    //    console.log(data);
                    //    if (data) {
                    //        alreadyExist.css('display', 'none');
                    //        message.css('display', 'none');
                    //        good.css('display', 'block');
                    //        $scope.unique = true;
                    //    }
                    //    else {
                    //        alreadyExist.css('display', 'block');
                    //        message.css('display', 'none');
                    //        good.css('display', 'none');
                    //        $scope.unique = false;
                    //    }
                    //});

                    Users[param].isUnique(value).$promise.then(function (data) {
                        data.$promise.then(function (data) {

                        });

                    });

                    //$http.get($rootScope.contextPath + $rootScope.restPath +
                    //'/users/actions/is' + param + 'Unique', {params: value})
                    //    .success(function (data) {
                    //        if (data) {
                    //            alreadyExist.css('display', 'none');
                    //            message.css('display', 'none');
                    //            good.css('display', 'block');
                    //            $scope.unique = true;
                    //        }
                    //        else {
                    //            alreadyExist.css('display', 'block');
                    //            message.css('display', 'none');
                    //            good.css('display', 'none');
                    //            $scope.unique = false;
                    //        }
                    //    });
                } else {
                    alreadyExist.css('display', 'none');
                    message.css('display', 'block');
                    good.css('display', 'none');
                    $scope.unique = false;
                }
            }
        }, 0);
    };

    // MENU LOADING WHEN MAIN IS READY
    function loadMenu() {
        var nav = $('.navigation');
        if (nav.html() == "" || !nav.hasClass('settings_menu') || nav.hasClass('user_menu')) {
            nav.text('');
            $('.main').ready(function () {
                $http.get($rootScope.contextPath + '/components/settings/settings_menu.html').success(function (data) {

                    angular.element('.navigation').append($compile(data)($scope));
                    $('.ui.menu').find('.item').removeClass('active');
                    $('.' + $state.current.name).addClass('active');
                    nav.addClass('settings_menu');
                    nav.removeClass('user_menu');

                    $('.ui.menu .item').on('click', function () {
                        if (!$(this).hasClass('header')) {
                            $(this).addClass('active').closest('.ui.menu').find('.item').not($(this))
                                .removeClass('active');
                        }
                    });
                });
            });

        }
    }

    loadMenu();

    // SEMANTIC ANIMATION
    $('.info').popup();
});