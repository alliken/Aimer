app.directive('imageDrop', function ($parse, $document) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var onImageDrop = $parse(attrs.onImageDrop);
            var level;

            if (attrs.levelDrop) {
                level = attrs.levelDrop;
            } else {
                level = 0;
            }

            //When an item is dragged over the document
            var onDragOver = function (e) {
                e.preventDefault();
                element.addClass("image-drag-enter");
            };

            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
                e.preventDefault();
                element.removeClass("image-drag-enter");
            };

            //When a file is dropped
            var loadFile = function (file) {
                switch (level) {
                    case '0':
                        scope.uploadedFile = file;
                        break;
                    case '1':
                        scope.$parent.uploadedFile = file;
                        break;
                    case '2':
                        scope.$parent.$parent.uploadedFile = file;
                        break;
                }
                scope.$apply(onImageDrop(scope));
            };

            //Dragging begins on the document
            $document.bind("dragover", onDragOver);

            //Dragging ends on the overlay, which takes the whole window
            $document.bind("dragleave", onDragEnd);
            element.bind("drop", function (e) {
                    angular.element('.image-drag-enter').removeClass('image-drag-enter');
                    e.preventDefault();
                    loadFile(e.originalEvent.dataTransfer.files);
                });
        }
    };
});