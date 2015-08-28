app.directive('searchList', function ($location) {
    return function (scope, element, attrs) {
        element.bind("keydown", function (event) {
            var item = $('.search-list').find($('a.item.us'));
            var active = $('.search-list').find($('a.item.us.active'));
            if(event.which === 40) {   // down key
                scope.$apply(function (){
                    scope.$eval(attrs.searchList);
                    if (active.length == 0) {
                        $(item[0]).addClass('active');
                    } else {
                       var next = $(active).next();
                        if (next.is($('div'))) {
                            $(active).removeClass('active');
                            $(item[0]).addClass('active');
                        }
                        else {
                            $(active).removeClass('active').next().addClass('active');
                        }
                    }
                });
                event.preventDefault();

            } else if (event.which === 38) {   // up key
                scope.$apply(function (){
                    scope.$eval(attrs.searchList);
                    if (active.length == 0) {
                        $(item[item.length-1]).addClass('active');
                    } else {
                        var prev = $(active).prev();
                        if ($(prev).length == 0) {
                            $(item[item.length-1]).addClass('active');
                            $(active).removeClass('active');
                            return;
                        }
                        $(active).removeClass('active').prev().addClass('active');
                    }
                });
                event.preventDefault();

            } else if (event.which === 13) { // enter
                scope.$apply(function (){
                    scope.$eval(attrs.searchList);
                    if (active.length !== 0) {
                        $location.path('/' + $(active).attr('click-data'));
                        scope.searchFriends = '';
                        $('.search-input').blur();
                    }
                });
            }
        });
    };
});