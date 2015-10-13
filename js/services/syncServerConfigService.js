app.service('timeSyncServer', function () {
    var commentEditingTime = 10; // min - time when user still can edit its comment
    var authTime = 15; // min - time user is authorized on server without actions

    return {
        commentEditingTime: function () {
            return commentEditingTime * 60 * 1000;
        },
        authTime: function () {
            return authTime * 60 * 1000;
        }
    }
});