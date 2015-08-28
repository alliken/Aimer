jQuery(function ($) {

    // Create variables (in this scope) to hold the API and image size
    var jcrop_api,
        boundx,
        boundy,

    // Grab some information about the preview pane
        $preview = $('#preview-pane'),
        $pimg = $('.preview-container img'),

        xsize = 170,
        ysize = 170;


    $('#target').Jcrop({
        onChange: updatePreview,
        onSelect: updatePreview,
        aspectRatio: 1,
        boxWidth: 450
    }, function () {
        var bounds = this.getBounds();
        boundx = bounds[0];
        boundy = bounds[1];
        jcrop_api = this;
        $preview.appendTo(jcrop_api.ui.holder);
    });

    function updatePreview(c) {
        {
            if (parseInt(c.w) > 0) {
                var rx = xsize / c.w;
                var ry = ysize / c.h;

                pointsToCrop = {
                    height: Math.ceil(c.h),
                    width: Math.ceil(c.w),
                    x: Math.ceil(c.x),
                    y: Math.ceil(c.y)
                };

                $pimg.css({
                    width: Math.round(rx * boundx) + 'px',
                    height: Math.round(ry * boundy) + 'px',
                    marginLeft: '-' + Math.round(rx * c.x) + 'px',
                    marginTop: '-' + Math.round(ry * c.y) + 'px'
                });
            }
        }
    }

    function getRandom() {
        var dim = jcrop_api.getBounds();
        return [
            Math.round(dim[0]/4),
            Math.round(dim[1]/4),
            dim[0] - Math.round(dim[0]/3),
            dim[1] - Math.round(dim[1]/3)

        ];
    }

    var setEdges = function () {
        jcrop_api.animateTo(getRandom());
    };

    setEdges();

    changeImageWithPreview = function (e, source) {
        jcrop_api.setImage(source, function(j){

            jcrop_api.setOptions({
                onChange: updatePreview,
                onSelect: updatePreview,
                aspectRatio: 1,
                boxWidth: 450
            });
            var bounds = jcrop_api.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            setEdges();
        });
    }
});