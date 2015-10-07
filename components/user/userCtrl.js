// USER INTERFACE CONTROLLER
app.controller('userCtrl', function ($http, $compile, $scope, $rootScope, $stateParams, followService, Users) {
    var userCtrl = this;
    var ang = angular.element;
    $scope.user = $rootScope.currentUser;
    $scope.isFirstUpload = 0;
    userCtrl.follow = followService.follow;
    userCtrl.unFollow = followService.unFollow;
    followService.checkIsFollowing($rootScope.anotherUser.userId); // Checks if current user follows another
    $scope.followingFollowers = {};
    $scope.friends = [];
    $scope.steps = [];

    /**
     * Loads left-aligned menu to user page
     */
    (function loadMenu() {
        var nav = ang('.navigation');
        nav.text('');
        if (nav.html() == "" || !nav.hasClass('user_menu') || nav.hasClass('settings_menu')) {
            $http.get($rootScope.contextPath + '/components/user/user_menu.html')
                .success(function (data) {
                    ang('.navigation').append($compile(data)($scope));
                    nav.addClass('user_menu');
                    nav.removeClass('settings_menu');

                    $(document).scroll(function () {
                        var y = $(this).scrollTop();
                        var parentWidth = $('.navigation').width();
                        if (y > 280) {
                            $('.scrolling-container').removeClass('unscrolled').addClass('scrolled')
                                .css('width', parentWidth + 3);
                        } else {
                            $('.scrolling-container').removeClass('scrolled').addClass('unscrolled');
                        }
                    });

                });
        }
    })();

    /**
     * Loads background html and sets
     */
    (function loadBackground() {
        var container = $('.background-container');

        container.text('');
        container.removeClass('loaded');

        if (!container.hasClass('loaded')) {
            $http.get($rootScope.contextPath + '/components/user/background.html')
                .success(function (data) {
                    ang('.background-container').append($compile(data)($scope));
                    container.addClass('loaded');
                });
        }
    })();

    /**
     * Gets current or another user following/followers quantity by id
     * @param id
     */
    (function getFollowingFollowers() {
        var id = $rootScope.anotherUser.userId || $rootScope.currentUser.userId;
        Users.getFollowingFollowers(id).$promise.then(function (data) {
            $scope.followingFollowers = {
                following: data.followingCount,
                followers: data.followersCount,
                aim: data.aimCount
            }
        }, function () {
            console.log('User doesn\'t exist');
        })
    })();

    function showSignUpMessage() {
        if (!$rootScope.authenticated && ($stateParams.user != 404)) {
            setTimeout(function () {
                ang('.signup-please').slideDown(300);
            }, 4000);
        }
    }

    //JCROP LIBRARY
    userCtrl.jcrop = function () {
        jQuery(function ($) {

            // Create variables (in this scope) to hold the API and image size
            var jcrop_api,
                boundx,
                boundy,

            // Grab some information about the preview pane
                $previewLarge = $('#preview-pane-large'),
                $pimgLarge = $('.preview-container-large img'),
                xsizeLarge = 210,
                ysizeLarge = 210,


                $previewSmall = $('#preview-pane-small'),
                $pimgSmall = $('.preview-container-small img'),
                xsizeSmall = 30,
                ysizeSmall = 30;


            $('#target').Jcrop({
                onChange: updatePreview,
                onSelect: updatePreview,
                aspectRatio: 1,
                boxWidth: 400,
                boxHeight: 300
            }, function () {
                var bounds = this.getBounds();
                boundx = bounds[0];
                boundy = bounds[1];
                jcrop_api = this;
                $previewLarge.appendTo(jcrop_api.ui.holder);
                $previewSmall.appendTo(jcrop_api.ui.holder);
            });

            userCtrl.changeImageWithPreview = function (e, source) {
                jcrop_api.setImage(source, function () {

                    jcrop_api.setOptions({
                        onChange: updatePreview,
                        onSelect: updatePreview,
                        aspectRatio: 1,
                        boxWidth: 450,
                        setSelect: setEdges(),
                        minSize: [210, 210]
                    });

                    var bounds = jcrop_api.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];
                });
            };

            userCtrl.changeImageWithoutPreview = function (e, source) {
                jcrop_api.setImage(source, function () {

                    var block = $('.background'),
                        blockWidth = block.width(),
                        blockHeight = block.height();

                    jcrop_api.setOptions({
                        onChange: updatePoints,
                        onSelect: updatePoints,
                        //aspectRatio: blockWidth / blockHeight,
                        aspectRatio: 2.56,
                        boxWidth: 450,
                        setSelect: setEdges(),
                        minSize: [1000, 300]
                    });

                    var bounds = jcrop_api.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];
                });
            };

            function updatePreview(c) {
                {
                    if (parseInt(c.w) > 0) {
                        var rxLarge = xsizeLarge / c.w;
                        var ryLarge = ysizeLarge / c.h;
                        var rxSmall = xsizeSmall / c.w;
                        var rySmall = ysizeSmall / c.h;

                        $scope.pointsToCrop = {
                            height: Math.floor(c.h),
                            width: Math.floor(c.w),
                            x: Math.floor(c.x),
                            y: Math.floor(c.y)
                        };

                        $pimgLarge.css({
                            width: Math.round(rxLarge * boundx) + 'px',
                            height: Math.round(ryLarge * boundy) + 'px',
                            marginLeft: '-' + Math.round(rxLarge * c.x) + 'px',
                            marginTop: '-' + Math.round(ryLarge * c.y) + 'px'
                        });

                        $pimgSmall.css({
                            width: Math.round(rxSmall * boundx) + 'px',
                            height: Math.round(rySmall * boundy) + 'px',
                            marginLeft: '-' + Math.round(rxSmall * c.x) + 'px',
                            marginTop: '-' + Math.round(rySmall * c.y) + 'px'
                        });
                    }
                }
            }

            function updatePoints(c) {
                {
                    if (parseInt(c.w) > 0) {

                        $scope.pointsToCrop = {
                            height: Math.floor(c.h),
                            width: Math.floor(c.w),
                            x: Math.floor(c.x),
                            y: Math.floor(c.y)
                        };
                    }
                }
            }

            function setEdges() {
                var dim = jcrop_api.getBounds();
                return [
                    Math.round(dim[0] / 4),
                    Math.round(dim[1] / 4),
                    dim[0] - Math.round(dim[0] / 3),
                    dim[1] - Math.round(dim[1] / 3)

                ];
            }

        });
    };

    /**
     * Uploads user photo (avatar) to client.
     *
     * @param file - if it exists function insert picture into preview pane and asks user to select edges to cut.
     * This param transfers when user used drag&drop.
     *
     * @function {insertPictureDrag} inserts dragged picture in preview pane
     * @function {insertPicture} inserts input uploaded image in preview pane
     */
    userCtrl.uploadPhoto = function (file) {

        if (file) {
            if (!$scope.isFirstUpload) {
                insertPictureDrag(file, true);
            } else {
                insertPictureDrag(file, false);
            }
        } else {
            var input = document.getElementById('image-file');
            input.click();

            input.onchange = function () {
                if (!$scope.isFirstUpload) {
                    insertPicture(input, true);
                } else {
                    insertPicture(input, false);
                }
            };
        }

        function insertPicture(input, ifFirstUpload) {
            if (input.files && input.files[0]) {
                var reader = new FileReader(),
                    largeImage = $('#preview-image-large'),
                    smallImage = $('#preview-image-small'),
                    targetImage = document.getElementById("target");

                reader.onload = function (e) {
                    targetImage.setAttribute('src', e.target.result);
                    if ((targetImage.naturalHeight < 210) || (targetImage.naturalWidth < 210)) {
                        //TODO designed alert about image resolution
                        alert('Image should resolution should be more than 210x210 pixels');
                    } else {
                        if (ifFirstUpload) {
                            userCtrl.jcrop();
                            userCtrl.changeImageWithPreview(e, e.target.result);
                        } else {
                            userCtrl.changeImageWithPreview(e, e.target.result);
                        }
                        smallImage.css('display', 'block');
                        largeImage.css('display', 'block');
                        largeImage.attr('src', e.target.result);
                        smallImage.attr('src', e.target.result);
                        $('.upload-avatar').show();
                        $('.modal-box').show();
                        $scope.isFirstUpload = 1;
                    }

                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function insertPictureDrag(file, ifFirstUpload) {
            var reader = new FileReader(),
                largeImage = $('#preview-image-large'),
                smallImage = $('#preview-image-small'),
                targetImage = document.getElementById("target");

            reader.onload = function (e) {
                targetImage.setAttribute('src', e.target.result);
                if ((targetImage.naturalHeight < 210) || (targetImage.naturalWidth < 210)) {
                    //TODO designed alert about image resolution
                    alert('Image should resolution should be more than 210x210 pixels');
                } else {
                    if (ifFirstUpload) {
                        userCtrl.jcrop();
                        userCtrl.changeImageWithPreview(e, e.target.result);
                    } else {
                        userCtrl.changeImageWithPreview(e, e.target.result);
                    }
                    smallImage.css('display', 'block');
                    largeImage.css('display', 'block');
                    largeImage.attr('src', e.target.result);
                    smallImage.attr('src', e.target.result);
                    $('.upload-avatar').show();
                    $('.modal-box').show();
                    $scope.isFirstUpload = 1;
                }

            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Sends client uploaded image (avatar) and four crop points to server
     */
    userCtrl.sendPhoto = function () {
        var input = document.getElementById('image-file');

        if ((input.files.length !== 0) || $scope.uploadedFile) {
            var formData = new FormData();

            formData.append('photo', input.files[0] || $scope.uploadedFile);
            $scope.pointsToCrop = JSON.stringify($scope.pointsToCrop);
            formData.append('params', $scope.pointsToCrop);
            $http({
                method: 'POST',
                url: $rootScope.contextPath + $rootScope.restPath + '/users/actions/uploadProfileImage',
                headers: {'Content-Type': undefined},
                data: formData,
                transformRequest: function (data) {
                    return data;
                }
            })
                .success(function (data) {
                    $rootScope.currentUser.largePicture = $rootScope.contextPath + (data.largePicture ?
                        (data.largePicture + (data.largePicture.indexOf("?") > 0 ? "&" : "?") +
                        new Date().getTime()) : (''));
                    $rootScope.currentUser.smallPicture = $rootScope.contextPath + (data.smallPicture ?
                        (data.smallPicture + (data.smallPicture.indexOf("?") > 0 ? "&" : "?") +
                        new Date().getTime()) : (''));
                    //$('.save-photo').removeClass('blue').addClass('green').html('<i class="checkmark icon"></i>Saved');
                    //setTimeout(closeModalBox, 1000);
                    closeModalBox();
                    $scope.pointsToCrop = undefined;
                    $scope.uploadedFile = "";
                    input.value = "";
                })
                .error(function () {
                    // TODO Inform user about email confirmation
                    $scope.pointsToCrop = undefined;
                })
        }
    };

    // UPLOAD BACKGROUND
    userCtrl.uploadBackground = function (file) {

        if (file) {
            if (!$scope.isFirstUpload) {
                insertPictureDrag(file, true);
            } else {
                insertPictureDrag(file, false);
            }
        } else {
            var input = document.getElementById('image-background');
            input.click();

            input.onchange = function () {
                if (!$scope.isFirstUpload) {
                    insertPicture(input, true);
                } else {
                    insertPicture(input, false);
                }
            };
        }

        function insertPicture(input, ifFirstUpload) {
            if (input.files && input.files[0]) {
                var reader = new FileReader(),
                    targetImage = document.getElementById("target");

                reader.onload = function (e) {
                    targetImage.setAttribute('src', e.target.result);
                    if (targetImage.naturalHeight < 300) {
                        //TODO designed alert about image resolution
                        alert('Image should height should be more than 300 pixels');
                    } else {
                        if (ifFirstUpload) {
                            userCtrl.jcrop();
                            userCtrl.changeImageWithoutPreview(e, e.target.result);
                        } else {
                            userCtrl.changeImageWithoutPreview(e, e.target.result);
                        }
                        $('.upload-background').show();
                        $('.modal-box').show();
                        $scope.isFirstUpload = 1;
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        function insertPictureDrag(file, ifFirstUpload) {
            var reader = new FileReader(),
                targetImage = document.getElementById("target");

            reader.onload = function (e) {
                targetImage.setAttribute('src', e.target.result);
                if (targetImage.naturalHeight < 300) {
                    //TODO designed alert about image resolution
                    alert('Image should height should be more than 300 pixels');
                } else {
                    if (ifFirstUpload) {
                        userCtrl.jcrop();
                        userCtrl.changeImageWithoutPreview(e, e.target.result);
                    } else {
                        userCtrl.changeImageWithoutPreview(e, e.target.result);
                    }
                    $('.upload-background').show();
                    $('.modal-box').show();
                    $scope.isFirstUpload = 1;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // SEND BACKGROUND TO SERVER
    userCtrl.sendBackground = function () {
        var formData = new FormData(),
            input = document.getElementById('image-background');

        formData.append('photo', input.files[0] || $scope.uploadedFile);
        $scope.pointsToCrop = JSON.stringify($scope.pointsToCrop);
        formData.append('params', $scope.pointsToCrop);
        $http({
            method: 'POST',
            url: $rootScope.contextPath + $rootScope.restPath + '/users/actions/uploadBackground',
            headers: {'Content-Type': undefined},
            data: formData,
            transformRequest: function (data) {
                return data;
            }
        })
            .success(function (data) {
                $rootScope.currentUser.backgroundPicturePath = $rootScope.contextPath + data.backgroundPicturePath + '?' +
                new Date().getTime();
                closeModalBox();
                $scope.pointsToCrop = undefined;
                input.value = "";
                $scope.uploadedFile = "";
            })
            .error(function () {
                $scope.pointsToCrop = undefined;
            })

    };

    //UPLOAD AVATAR (DRAG AND DROP)
    userCtrl.uploadPhotoDrag = function () {
        var file = $scope.uploadedFile[0];
        userCtrl.uploadPhoto(file);
    };

    //UPLOAD BACKGROUND (DRAG AND DROP)
    userCtrl.uploadBackgroundDrag = function () {
        var file = $scope.uploadedFile[0];
        userCtrl.uploadBackground(file);
    };

    //SHOW AND HIDE EDIT BACKGROUND PANEL
    userCtrl.showEditBackgroundPanel = function () {
        $('.edit-background-panel').show();
    };
    userCtrl.hideEditBackgroundPanel = function () {
        $('.edit-background-panel').hide();
    };

    $('.modal-close').click(function () {
        closeModalBox();
    });

    var closeModalBox = function () {
        $('#preview-image-small').css('display', 'none');
        $('#preview-image-large').css('display', 'none');
        $('.upload-avatar').hide();
        $('.upload-background').hide();
        $('.modal-box').hide();
        $('.save-photo').removeClass('green').addClass('blue').html('Save');
    };

    //HIDE OR SHOW UNFOLLOW (UNSUBSCRIBE) BUTTON
    userCtrl.showUnfollowButton = function () {
        $('.following-button').hide();
        $('.unfollow-button').show();
    };
    userCtrl.hideUnfollowButton = function () {
        $('.unfollow-button').hide();
        $('.following-button').show();
    };

    $scope.setHightLight = function () {
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    };

    $scope.hideBlock = function (selector) {
        ang(selector).hide();
    };

});