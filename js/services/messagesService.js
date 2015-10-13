app.service('messages', function () {
    return {
        errorMessage: function (message) {
            var block = angular.element('.error-message-block');
            var textBlock = block.find('.text');
            angular.element(textBlock).html(message);
            block.show();
        }
    }
});