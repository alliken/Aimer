var app = angular.module('aimer', ['ui.router']);//, 'uiRouterStyles']);

//TODO comment
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $controllerProvider) {

    app.lazy = {
        controller: $controllerProvider.register
    };

    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', {
            url: '/',
            data: {
                js: '',
                showIfAuth: false,
                css: '',
                isPublic: false
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: 'components/login/login.html',
            controller: 'loginCtrl',
            data: {
                css: 'components/login/login.css',
                js: ['components/login/ngFocusDirective.js',
                    'components/login/passwordMatchDirective.js'],
                showIfAuth: false,
                isPublic: true
            }
        })
        .state('login_error', {
            url: '/login_error',
            templateUrl: 'components/login/login_error.html',
            controller: 'loginCtrl',
            data: {
                css: 'components/login/login_error.css',
                js: ['components/login/loginCtrl.js',
                    'components/login/ngFocusDirective.js',
                    'components/login/passwordMatchDirective.js'],
                showIfAuth: false,
                isPublic: true
            }
        })
        .state('password_recovery', {
            url: '/password_recovery',
            templateUrl: 'components/password_recovery/password_recovery.html',
            controller: 'pswRecoveryCtrl',
            data: {
                css: 'components/login/login_error.css',
                js: 'components/password_recovery/pswRecoveryCtrl.js',
                showIfAuth: false,
                isPublic: true
            }
        })
        .state('reset_password', {
            url: '/users/actions/resetPassword/:token',
            templateUrl: 'components/password_recovery/password_recovery_new.html',
            controller: 'pswRecoveryCtrl',
            data: {
                css: 'components/login/login_error.css',
                js: 'components/password_recovery/pswRecoveryCtrl.js',
                showIfAuth: false,
                isPublic: true
            }
        })
        .state('password_recovery_new', {
            url: '/users/actions/resetPassword/:token',
            templateUrl: 'components/password_recovery/password_recovery_new.html',
            controller: 'pswRecoveryCtrl',
            data: {
                css: 'components/login/login_error.css',
                js: 'components/password_recovery/pswRecoveryCtrl.js',
                showIfAuth: false,
                isPublic: true
            }
        })
        .state('personal', {
            url: '/settings/personal',
            templateUrl: 'components/settings/settings_personal.html',
            controller: 'settingsCtrl',
            data: {
                css: 'components/settings/settings.css',
                js: 'components/settings/settingsCtrl.js',
                showIfAuth: true,
                isPublic: false
            }
        })
        .state('password', {
            url: '/settings/password',
            templateUrl: 'components/settings/settings_password.html',
            controller: 'settingsCtrl',
            data: {
                css: 'components/settings/settings.css',
                js: 'components/settings/settingsCtrl.js',
                showIfAuth: true,
                isPublic: false
            }
        })
        .state('error404', {
            url: '/404',
            templateUrl: 'components/error/404_not_found.html',
            controller: 'loginCtrl',
            data: {
                showIfAuth: true,
                isPublic: true
            }
        })
        .state('user', {
            url: '/:user', //TODO change to userLogin
            templateUrl: 'components/user/user.html',
            controller: 'userCtrl as userCtrl',
            data: {
                css: 'components/user/user.css',
                //js: 'components/user/userCtrl.js',
                showIfAuth: true,
                isPublic: true
            }
        });

    $locationProvider.html5Mode(true);

});

//TODO comment
app.run(function ($rootScope, $location, $state, userStorageService) {

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {

        //TODO comment
        var isPublic = toState.data.isPublic;
        //TODO comment
        var targetState = toState.name;
        //TODO comment
        var authTime = 15; // minutes
        angular.element('.signup-please').hide();

        //TODO подумать над синхронизацией с сервером. смотреть пример с Твиттером и ВК
        if ($rootScope.authTime) {
            $rootScope.currentTime = new Date().getTime();
            if (($rootScope.currentTime - $rootScope.authTime) > authTime * 60 * 1000) {
                $rootScope.prevented = false;
                $rootScope.authenticated = false;
            }
        }

        if ($rootScope.authenticated) {
            if (toState.data.showIfAuth) {
                return;
            } else {
                event.preventDefault();
                toParams.user = $rootScope.currentUser.login;
                $state.go('user', toParams);
                return;
            }
        }

        if ((targetState !== 'password') && (targetState !== 'personal')) {
            $('.navigation').html('');
        }

        if (!$rootScope.prevented) {
            event.preventDefault();
            userStorageService.getCurrentUser()
                .then(function () {
                    $rootScope.authTime = new Date().getTime();
                    $rootScope.prevented = true;
                    if (!toState.data.showIfAuth) {
                        $state.go('home');
                        return;
                    }
                    $state.go(toState, toParams);
                }, function () {
                    $rootScope.prevented = true;
                    if (!isPublic && (targetState != 'login')) {
                        $state.go('login');
                    } else {
                        $state.go(toState, toParams);
                    }
                })
        } else if ($rootScope.prevented && !isPublic && (targetState !== 'login')) {
            event.preventDefault();
            $state.go('login');
        }
    });
});
