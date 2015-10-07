app.factory('photoGrid', function () {
    var ang = angular.element;
    return {
        apply: function (editableAim) {
            var randomBoolean = [
                function () {
                    return Math.random() < .5; // Readable, succint
                },

                function () {
                    return !(Math.random() + .5 | 0); // (shortcut for Math.round)
                },

                function () {
                    return !(+new Date() % 2); // faux-randomness
                }
            ];
            $(ang(editableAim).find('.aim-images')).jPhotoGrid({
                margin: 1,
                isFirstRowBig: randomBoolean,
                isCentred: true,
                isSmallImageStretched: true
            });
        }
    }
});