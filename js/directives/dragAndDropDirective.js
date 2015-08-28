app.directive('imageDrop', function ($parse, $document) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var onImageDrop = $parse(attrs.onImageDrop);

            //When an item is dragged over the document
            var onDragOver = function (e) {
                e.preventDefault();
                element.addClass("drag-enter");
            };

            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
                e.preventDefault();
                element.removeClass("drag-enter");
            };

            //When a file is dropped
            var loadFile = function (file) {
                scope.uploadedFile = file;
                scope.$apply(onImageDrop(scope));
            };

            //Dragging begins on the document
            $document.bind("dragover", onDragOver);

            //Dragging ends on the overlay, which takes the whole window
            $document.bind("dragleave", onDragEnd);
            element.bind("drop", function (e) {
                    angular.element('.drag-enter').removeClass('drag-enter');
                    e.preventDefault();
                    loadFile(e.originalEvent.dataTransfer.files[0]);
                });
        }
    };
});