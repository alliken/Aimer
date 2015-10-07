app.directive('imageGrid', function ($timeout) {
    return function (scope, element) {
        if (scope.$last === true) {
            $timeout(function () {
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

                var grid = $($(element).parent());

                grid.css({
                    display: 'block',
                    height: '350px'
                });
                grid.jPhotoGrid({
                    margin: 1,
                    isFirstRowBig: randomBoolean,
                    isCentred: true,
                    isSmallImageStretched: true
                });
            });
        }
    }
});