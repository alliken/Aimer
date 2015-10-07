;
(function ($, window, document, undefined) {

    var pluginName = "jPhotoGrid";
    var defaults = {
        itemsType: "img", // Type of elements in the selector
        margin: 0, // Space between elements
        isFirstRowBig: false, // First row - largest
        uploadInput: null,
        transition: "1s ease",
        isCentred: true,
        isSmallImageStretched: false
    };

    function Plugin(element, options) {
        this.element = element;
        this._defaults = defaults;
        this._name = pluginName;
        this.options = $.extend({}, defaults, options);
        this.action = typeof options === "string" ? options : "default";

        if (this.options.uploadInput != null) {
            this.uploadImages();
        } else {
            this.init();
        }
    }

    Plugin.prototype.init = function () {
        switch (this.action) {
            case "clear":
                return this.clear();
                break;
            default:
                if (this.options.uploadInput != null) {
                    return this.start();
                } else {
                    return this.waitForImageLoaded();
                }
                break;
        }
    };

    Plugin.prototype.waitForImageLoaded = function () {
        var it = this;
        // By default the plugin will wait until all of the images are loaded to setup the styles

        var hasDimensions = true;

        // Loops through all of the images in the photoset
        // if the height and width exists for all images set waitForImagesLoaded to false
        $(it.element).find(it.options.itemsType).each(function () {
            hasDimensions = hasDimensions & ( !!$(this).attr('height') & !!$(this).attr('width') );
        });

        var waitForImagesLoaded = !hasDimensions;

        // Only use imagesLoaded() if waitForImagesLoaded
        if (waitForImagesLoaded) {
            $(it.element).imagesLoaded()
                .done(function () {
                    it.start();
                });

        } else {
            it.start();
        }
    };

    Plugin.prototype.start = function () {
        var it = this;
        var time = new Date().getTime();
        var numRow = 0;
        var classWidth = 0;
        this.clear();
        var $images = $(it.element).find(it.options.itemsType);

        if (it.options.isSmallImageStretched && $images.length === 1 && $images[0].naturalWidth < $(it.element).width()
            && $images[0].naturalHeight < $(it.element).height()) {
            it.displayItems();
            $(it.element).append("<div class='jPhotoGrid-clear'></div>");
            return;
        }

        it.options.minRowHeight = (function computeMinRowHeight($images) {
            var reqWidth = Math.sqrt($(it.element).height() * $(it.element).width() / $images.length);
            var minRowHeight = Infinity;

            $images.each(function () {
                //natural Sizes are used because during the program image.width and image.height are changing
                //So if we need to upload files more than 1 time. We need to know the origin size of image
                var temp = $(this)[0].naturalHeight / $(this)[0].naturalWidth * reqWidth;
                if (temp < minRowHeight) {
                    minRowHeight = temp;
                }
            });

            minRowHeight += 2 * $images.length / 3;

            return minRowHeight;
        })($images);

        if (it.options.isFirstRowBig) {
            it.reverseItems();
        }

        $(it.element).addClass("jPhotoGrid-selector");

        var $elements = $(it.element).find(it.options.itemsType);
        var rowHeightArray = [];

        var copyElements = [];

        $elements.each(function (i) {

            $(this).addClass("jPhotoGrid-item");

            var newWidth = it.itemNewWidth(this, it.options.minRowHeight);

            $(this).css({
                "margin": it.options.margin + "px"
            });

            var elementOuterWidth = newWidth + 2 * it.options.margin;

            if (i == 0 || classWidth + elementOuterWidth <= $(it.element).width()) {
                classWidth += elementOuterWidth;
            }
            else {
                rowHeightArray.push(it.stretchingRow(".jPhotoGrid-row_" + numRow, classWidth, copyElements));
                classWidth = elementOuterWidth;
                numRow++;
            }

            copyElements.push({
                className: ".jPhotoGrid-row_" + numRow,
                width: newWidth,
                height: it.options.minRowHeight
            });

            $(this).addClass("jPhotoGrid-row_" + numRow);
            if (i == $elements.length - 1) {
                rowHeightArray.push(it.stretchingRow(".jPhotoGrid-row_" + numRow, classWidth, copyElements));
            }
        });

        if (it.options.isFirstRowBig) {
            it.reverseItems();
            rowHeightArray.reverse();
            copyElements.reverse();
        }

        var rowsHeightSum = 0;
        for (var i = 0; i < rowHeightArray.length; i++) {
            rowsHeightSum += rowHeightArray[i];
        }
        for (var j = 0; j < rowHeightArray.length; j++) {
            rowHeightArray[j] /= rowsHeightSum;
        }

        if (rowsHeightSum > $(it.element).height()) {
            this.wrapImages(rowHeightArray, $, it);
        }

        it.displayItems();

        $(it.element).append("<div class='jPhotoGrid-clear'></div>");
        //console.log(new Date().getTime() - time);
    };


    Plugin.prototype.itemNewWidth = function (item, newHeight) {
        var width = typeof($(item).attr("width")) != 'undefined' ? Math.round($(item).attr("width")) : $(item).width();
        var height = typeof($(item).attr("height")) != 'undefined' ? Math.round($(item).attr("height")) : $(item).height();
        var prop = width / height;
        var newWidth = newHeight * prop;

        return Math.round(newWidth);
    };

    Plugin.prototype.stretchingRow = function (className, classWidth, copyElements) {
        var it = this;
        var row = $(it.element).find(className);
        var rowElementsArray = $.grep(copyElements, function(e){ return e.className == ("" + className)});
        var classHeight = Math.round(rowElementsArray[0].height) + 2 * it.options.margin;
        var requiredWidth = $(it.element).width();
        /* scrollbar fix (for relative selector width) */
        var requiredHeight = classHeight / classWidth * requiredWidth;
        var resultWidth = 0;

        row.each(function (i) {
            $(this).width(it.itemNewWidth(rowElementsArray[i], (requiredHeight - it.options.margin * 2)));
            //$(this).animate({
            //    width: it.itemNewWidth(rowElementsArray[i], (requiredHeight - it.options.margin * 2))
            //});
            resultWidth += $(this).outerWidth(true);
        });

        row.height(requiredHeight - it.options.margin * 2);

        var lastElementWidth = row.last().outerWidth(true) + (requiredWidth - resultWidth) - it.options.margin * 2;
        row.last().width(lastElementWidth);
        //row.last().animate({
        //    width: lastElementWidth
        //});
        return requiredHeight;
    };

    Plugin.prototype.wrapImages = function (rowHeightArray, $, it) {

        var wrapElementWithDiv = function (height, width, margin_top) {
            $(this).wrap("<div class='jPhotoGrid_image_wrapper' style='overflow: hidden; height: "
                + height + "px; width: " + width + "px; float:left; margin-top: " + margin_top + "px;'></div>");
        };

        for (var k = 0; k < rowHeightArray.length; k++) {
            var $rowElements = $(it.element).find(".jPhotoGrid-row_"
                + (it.options.isFirstRowBig ? rowHeightArray.length - k - 1 : k ));

            $rowElements.each(function () {
                if (k === 0) {
                    wrapElementWithDiv.call(this, rowHeightArray[k] * $(it.element).height() - 2 * it.options.margin,
                        $(this).width() + 2 * it.options.margin, it.options.margin);

                } else {
                    wrapElementWithDiv.call(this, rowHeightArray[k] * $(it.element).height() - 2 * it.options.margin,
                        $(this).width() + 2 * it.options.margin, 2 * it.options.margin);
                }

                $(this).css({
                    "margin-top": (-($(this).height() - rowHeightArray[k] * $(it.element).height()) / 2 - it.options.margin)
                    + "px"
                });
            })
        }
    };

    Plugin.prototype.reverseItems = function () {
        var it = this;
        var items = $.makeArray($(it.element).find(it.options.itemsType));
        items.reverse();
        $(it.element).html(items);
    };

    Plugin.prototype.uploadImages = function () {
        var it = this;
        it.options.uploadInput.onchange = function () {

            var fileReader = new FileReader();
            var files = input.files;
            var filesCount = input.files.length;
            var i = 0;

            (function recursiveUploadImageFromReader() {

                if (i < filesCount) {
                    fileReader.onloadend = function () {
                        var img = document.createElement(it.options.itemsType);
                        img.setAttribute("src", fileReader.result);
                        img.style.display = "none";
                        it.element.appendChild(img);

                        i++;
                        recursiveUploadImageFromReader();
                    };

                    fileReader.readAsDataURL(files[i]);
                } else {
                    it.init();
                }
            })();
        }
    };

    Plugin.prototype.displayItems = function () {
        var it = this;
        var $images = $(it.element).find(this.options.itemsType);
        $images.each(function () {
            $(this).removeAttr("display").css({
                "display": "inline",
                "float": "left"
            });
        });

        if (it.options.isCentred) {
            var $wrappers = $(it.element).find(".jPhotoGrid_image_wrapper");
            if ($wrappers.length != 0) {
                $wrappers.wrapAll("<div class='jPhotoGrid_centred_block' style='display: inline-block;'></div>");
            } else {
                $images.wrapAll("<div class='jPhotoGrid_centred_block' style='display: inline-block;'></div>");
            }

            var $elem = $(it.element).find(".jPhotoGrid_centred_block");
            $elem.last().append("<div style='clear: both;'></div>");
            $elem.removeAttr("margin").css({
                "padding-top": (($(it.element).height() - $elem.height()) / 2 - it.options.margin) + "px",
                "padding-left": (($(it.element).width() - $elem.width()) / 2) + "px"
            });
        }
    };

    Plugin.prototype.clear = function () {
        var it = this;
        $(it.element).find(".jPhotoGrid-item").each(function () {
            $(this)[0].className = $(this)[0].className.replace(/\bjPhotoGrid-row_.*?\b/g, '');
        });
        $(it.element).find(".jPhotoGrid-item").removeClass("jPhotoGrid-item");
        $(it.element).find(".jPhotoGrid-clear").remove();
        $(it.element).removeClass("jPhotoGrid-selector");
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
        });
    };

    /*!
     * jQuery imagesLoaded plugin v2.1.1
     * http://github.com/desandro/imagesloaded
     *
     * MIT License. by Paul Irish et al.
     */

    /*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */
    /*global jQuery: false */

    // blank image data-uri bypasses webkit log warning (thx doug jones)
    var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    $.fn.imagesLoaded = function (callback) {
        var $this = this,
            deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
            hasNotify = $.isFunction(deferred.notify),
            $images = $this.find('img').add($this.filter('img')),
            loaded = [],
            proper = [],
            broken = [];

        // Register deferred callbacks
        if ($.isPlainObject(callback)) {
            $.each(callback, function (key, value) {
                if (key === 'callback') {
                    callback = value;
                } else if (deferred) {
                    deferred[key](value);
                }
            });
        }

        function doneLoading() {
            var $proper = $(proper),
                $broken = $(broken);

            if (deferred) {
                if (broken.length) {
                    deferred.reject($images, $proper, $broken);
                } else {
                    deferred.resolve($images);
                }
            }

            if ($.isFunction(callback)) {
                callback.call($this, $images, $proper, $broken);
            }
        }

        function imgLoadedHandler(event) {
            imgLoaded(event.target, event.type === 'error');
        }

        function imgLoaded(img, isBroken) {
            // don't proceed if BLANK image, or image is already loaded
            if (img.src === BLANK || $.inArray(img, loaded) !== -1) {
                return;
            }

            // store element in loaded images array
            loaded.push(img);

            // keep track of broken and properly loaded images
            if (isBroken) {
                broken.push(img);
            } else {
                proper.push(img);
            }

            // cache image and its state for future calls
            $.data(img, 'imagesLoaded', {isBroken: isBroken, src: img.src});

            // trigger deferred progress method if present
            if (hasNotify) {
                deferred.notifyWith($(img), [isBroken, $images, $(proper), $(broken)]);
            }

            // call doneLoading and clean listeners if all images are loaded
            if ($images.length === loaded.length) {
                setTimeout(doneLoading);
                $images.unbind('.imagesLoaded', imgLoadedHandler);
            }
        }

        // if no images, trigger immediately
        if (!$images.length) {
            doneLoading();
        } else {
            $images.bind('load.imagesLoaded error.imagesLoaded', imgLoadedHandler)
                .each(function (i, el) {
                    var src = el.src;

                    // find out if this image has been already checked for status
                    // if it was, and src has not changed, call imgLoaded on it
                    var cached = $.data(el, 'imagesLoaded');
                    if (cached && cached.src === src) {
                        imgLoaded(el, cached.isBroken);
                        return;
                    }

                    // if complete is true and browser supports natural sizes, try
                    // to check for image status manually
                    if (el.complete && el.naturalWidth !== undefined) {
                        imgLoaded(el, el.naturalWidth === 0 || el.naturalHeight === 0);
                        return;
                    }

                    // cached images don't fire load sometimes, so we reset src, but only when
                    // dealing with IE, or image is complete (loaded) and failed manual check
                    // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
                    if (el.readyState || el.complete) {
                        el.src = BLANK;
                        el.src = src;
                    }
                });
        }

        return deferred ? deferred.promise($this) : $this;
    };

})(jQuery, window, document);