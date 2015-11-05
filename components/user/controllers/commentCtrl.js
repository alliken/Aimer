'use strict';

app.controller('commentsCtrl', function ($scope, $rootScope, Comments, messages, $location, $timeout) {
    var commentsCtrl = this;
    var ang = angular.element;
    var commentBeforeEditing = '';
    commentsCtrl.aim = $scope.$parent.aimCtrl.aim;
    commentsCtrl.isFocused = false;
    commentsCtrl.comment = '';
    commentsCtrl.isEditing = false;
    commentsCtrl.usersVisible = false;
    commentsCtrl.comments = [];
    commentsCtrl.usersLiked = [];

    /**
     * Sets caret at the end of contentEditable DIV
     *
     * @param contentEditableElement
     */
    var setEndOfContenteditable = function (contentEditableElement) {
        var range,selection;
        if(document.createRange)
        {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else if(document.selection)
        {
            range = document.body.createTextRange();
            range.moveToElementText(contentEditableElement);
            range.collapse(false);
            range.select();
        }
    };

    /**
     * Creates new comment
     */
    commentsCtrl.createComment = function () {

        if (!commentsCtrl.comment) return;

        var aimId = commentsCtrl.aim.aimId;
        var commentObject = {
            commentId: null,
            content: commentsCtrl.comment,
            markedUsers: null
        };

        Comments.createComment(aimId, commentObject).$promise.then(function (data) {
            var date = new Date();
            var comment = {
                commentId: data.commentId,
                content: commentObject.content,
                dateOfAdding: ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
                '/' + date.getFullYear(),
                isEditable: true,
                userLogin: $rootScope.currentUser.login,
                userPicture: $rootScope.currentUser.smallPicture,
                likesCount: 0
            };
            commentsCtrl.comments.push(comment);
            commentsCtrl.comment = '';
            commentsCtrl.aim.commentsCount = commentsCtrl.aim.commentsCount + 1;

        }, function () {
            messages.errorMessage('This aim doesn\'t exist or you have no permission!')
        });
    };

    /**
     * Deletes comment
     *
     * @param id - comment id
     * @param index - comment index in array
     */
    commentsCtrl.deleteComment = function (id, index) {
        Comments.deleteComment(id).$promise.then(function () {
            commentsCtrl.comments.splice(index, 1);
            commentsCtrl.aim.commentsCount = commentsCtrl.aim.commentsCount - 1;
        }, function () {
            console.log('This comment doesn\'t exist or you have no permission');
        })
    };

    /**
     * Adds userLogin to comment textarea and focuses on it
     *
     * @param aimIndex - aim index in array
     * @param userLogin - user login to reply
     */
    commentsCtrl.reply = function (aimIndex, userLogin) {
        var textToInsert = '@' + userLogin + ',&nbsp';
        var commentArea = ang('.comment-area')[aimIndex];
        ang(commentArea).html(textToInsert);
        setEndOfContenteditable(commentArea);
    };

    /**
     * Set contentEditable to comment's content
     *
     * @param e
     * @param commentIndex
     * @param aimIndex
     */
    commentsCtrl.editComment = function (e, commentIndex) {
        if (commentsCtrl.isEditing) return;

        var currentComment = commentsCtrl.comments[commentIndex];
        var contentElement = ang(e.target).parent().parent().find('.content');
        currentComment.isEditing = true;
        commentsCtrl.isEditing = true;
        commentBeforeEditing = currentComment.content;

        ang(contentElement).attr({contenteditable: true}).addClass('editable-comment');
    };

    /**
     * Updates comment
     *
     * @param e
     * @param commentIndex
     */
    commentsCtrl.updateComment = function (e, commentIndex) {
        var currentComment = commentsCtrl.comments[commentIndex];
        var comment = new Comment(currentComment.commentId, currentComment.content, null);
        Comments.updateComment(comment).$promise.then(function () {
            if (!e) {
                var contentElement = $scope.element;
                ang(contentElement).attr({contenteditable: false}).removeClass('editable-comment');
            } else {
                var contentElement = ang(e.target).parent().parent().find('.content');
                ang(contentElement).attr({contenteditable: false}).removeClass('editable-comment');
            }

            currentComment.isEditing = false;
            commentsCtrl.isEditing = false;
        }, function () {
            console.log('Error');
        })
    };

    /**
     * Removes Editable styles and restores previous comment content
     *
     * @param e
     * @param commentIndex
     */
    commentsCtrl.cancelEditing = function (e, commentIndex) {
        var currentComment = commentsCtrl.comments[commentIndex];
        var contentElement = ang(e.target).parent().parent().find('.content');

        ang(contentElement).attr({contenteditable: false}).removeClass('editable-comment');
        currentComment.content = commentBeforeEditing;
        currentComment.isEditing = false;
        commentsCtrl.isEditing = false;

    };

    /**
     * Likes/Unlikes comment
     *
     * @param commentId
     * @param commentIndex
     */
    commentsCtrl.likeComment = function (commentIndex, commentId) {
        var currentComment = commentsCtrl.comments[commentIndex];

        if (currentComment.isUserLiked) {
            Comments.unlikeComment(commentId).$promise.then(function () {
                currentComment.likesCount = currentComment.likesCount - 1;
                currentComment.isUserLiked = false;

                removeCurrentUser(commentsCtrl.usersLiked);

                if (commentsCtrl.usersLiked.length == 0) {
                    commentsCtrl.usersVisible = false;
                }

            }, function () {
                messages.errorMessage('You have no permission to like comment!');
            })
        } else {
            Comments.likeComment(commentId).$promise.then(function () {
                currentComment.likesCount = currentComment.likesCount + 1;
                currentComment.isUserLiked = true;
                if (commentsCtrl.usersLiked.length > 4) {
                    commentsCtrl.usersLiked.pop();
                }
                commentsCtrl.usersLiked.unshift({
                    'smallPicture': $rootScope.currentUser.smallPicture,
                    'name': $rootScope.currentUser.name,
                    'login': $rootScope.currentUser.login
                });
            }, function () {
                messages.errorMessage('You have no permission to like comment!');
            })
        }

        function removeCurrentUser (usersLiked) {
            for (var i = 0; i <usersLiked.length; i++) {
                if (usersLiked[i].login == $rootScope.currentUser.login) {
                    usersLiked.splice(i, 1);
                }
            }
        }
    };

    /**
     * Redirects to user page by login
     *
     * @param login
     */
    commentsCtrl.redirectToUser = function (login) {
        $location.path('/' + login);
    };

    /**
     *  Get users liked comments by comment ID.
     *  It triggers by mouseEnter event and requests users after hover delay more than 1s.
     *
     *  @param commentId
     *  @param e event
     *
     */
    commentsCtrl.getUsersLiked = function (e, commentId) {
        var limit = 5; // users quantity to load
        var sendRequestDelay = 500;

        commentsCtrl.userLikedTimer = $timeout(function () {
            Comments.getUsers(commentId, limit).$promise.then(function (data) {
                if (data.length === 0) return;

                for (var i = 0; i < data.length; i++) {
                    data[i].smallPicture = $rootScope.contextPath + (data[i].smallPicture ?
                        (data[i].smallPicture + (data[i].smallPicture.indexOf("?") > 0 ? "&" : "?") +
                        new Date().getTime()) : (''));
                }

                commentsCtrl.usersLiked = data;

                var position = ang(e.target).position();
                var scrollTop = ang(e.target).parent().parent().parent().parent()[0].scrollTop;
                var offsetParent = ang(e.target).parent().parent()[0].offsetTop;
                var top = offsetParent - scrollTop;

                $timeout(function () {
                    commentsCtrl.usersVisible = true;
                    ang('.users-liked').css({
                        top: top - 60,
                        left: position.left - 90
                    });
                }, 0);

            }, function () {
                console.log('error');
            })
        }, sendRequestDelay);
    };

    /**
     * Cancels users liked request
     */
    commentsCtrl.cancelGetUsersLiked = function () {
        $timeout.cancel(commentsCtrl.userLikedTimer);

        commentsCtrl.hideUsersVisibleTimer = $timeout(function () {
            commentsCtrl.usersVisible = false;
        }, 500);
    };

    /**
     * Cancel $timeout that hides users-liked block
     */
    commentsCtrl.keepDisplay = function () {
        $timeout.cancel(commentsCtrl.hideUsersVisibleTimer);
    };

    /**
     * Hide users-liked block
     */
    commentsCtrl.hideUsersLiked = function () {
        commentsCtrl.usersVisible = false;
        console.log('error');
    }
});