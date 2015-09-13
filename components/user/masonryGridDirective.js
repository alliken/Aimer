app.directive('masonryGrid', function ($timeout) {
    return function (scope, element, attr) {

        $timeout(function () {
            delay();
        }, 1000);

        function delay() {
            var ang = angular.element;
            var imgs = ang(element)[0].children;
            var imgsLength = imgs.length;
            var dataLayout;

            if (imgsLength === 0) {
                return;
            }

            switch (imgsLength) {
                case 6:
                    dataLayout = '24';
                    break;
                case 5:
                    dataLayout = '23';
                    break;
                case 4:
                    dataLayout = '22';
                    break;
                case 3:
                    dataLayout = '3';
                    break;
                case 2:
                    dataLayout = '2';
                    break;
                case 1:
                    dataLayout = '1';
                    break;
            }

            $(element).photosetGrid({
                layout: dataLayout
            });
        }

    }
});