app.controller('commentsCtrl', function ($scope, $rootScope, Comments, messages) {
    var commentsCtrl = this;
    var ang = angular.element;
    var commentBeforeEditing = '';
    commentsCtrl.aim = $scope.$parent.sortedAims;
    commentsCtrl.isFocused = false;
    commentsCtrl.comment = '';
    commentsCtrl.isEditing = false;

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
                user: {
                    login: $rootScope.anotherUser.login,
                    smallPicture: $rootScope.anotherUser.smallPicture
                }
            };
            commentsCtrl.comments.push(comment);
            commentsCtrl.comment = '';
        }, function () {

            console.log('This aim doesn\'t exist or you have no permission!')
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
        var textToInsert = userLogin + ',&nbsp';
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
            var contentElement = ang(e.target).parent().parent().find('.content');
            ang(contentElement).attr({contenteditable: false}).removeClass('editable-comment');

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
            }, function () {
                messages.errorMessage('You have no permission to like comment!');
            })
        } else {
            Comments.likeComment(commentId).$promise.then(function () {
                currentComment.likesCount = commentsCtrl.comments[commentIndex].likesCount + 1;
                currentComment.isUserLiked = true;
            }, function () {
                messages.errorMessage('You have no permission to like comment!');
            })
        }
    };
});