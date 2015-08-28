app.directive('fontStyle', function () {
    return function (scope, element, attr) {
        element.bind('keydown', function (e) {
            if (e.which === 37 || e.which === 39) {
                scope.$apply(function () {
                    scope.$eval(attr.fontStyle);
                });
            } else if (e.which === 13) {
                e.preventDefault();
                var $li = $('<li></li>'),
                    sel = window.getSelection(),
                    range = sel.getRangeAt(0);

                range.collapse(false);
                if (range.startContainer.parentNode.nodeName == 'UL') {
                    range.startContainer.parentNode.appendChild($li.get(0));
                } else if (range.startContainer.parentNode.nodeName == 'LI') {
                    range.startContainer.parentNode.parentNode.appendChild($li.get(0));
                }
                range = range.cloneRange();
                range.selectNodeContents($li.get(0));
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });
        element.bind('click', function () {
            scope.$eval(attr.fontStyle);
        });


    };
});
