app.factory('photoGrid', function () {
    var ang = angular.element;
    return {
        apply: function (editableAim, selector) {

            if (!selector) selector = '.aim-images';

            $(ang(editableAim).find(selector)).jPhotoGrid({
                margin: 1,
                isFirstRowBig: Math.random() < .5,
                isCentred: true,
                isSmallImageStretched: true
            });
        }
    }
});