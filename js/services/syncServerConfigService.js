app.service('timeSyncServer', function () {
    var authTime = 15; // min - time user is authorized on server without actions
    var commentEditingTime = 5; // min - time when user still can edit its comment

    return {
        commentEditingTime: function () {
            return commentEditingTime * 60 * 1000;
        },
        authTime: function () {
            return authTime * 60 * 1000;
        }
    }
});