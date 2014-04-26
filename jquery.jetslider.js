;(function ($, win) {
    'use strict';

    var agent = {
        checkCssProp: function (prop) {
            var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
            var elem = win.document.createElement('div');

            if (typeof elem.style[prop] === 'string') {
                return prop;
            }
            for (var i = prefixes.length; i--; ) {
                var prefixedProp = prefixes[i] + prop.charAt(0).toUpperCase() + prop.slice(1);
                if (typeof elem.style[prefixedProp] == 'string') {
                    return '-' + prefixes[i].toLowerCase() + '-' + prop;
                }
            }
            return false;
        },

        supportsProps: function () {
            var props = [].slice.call(arguments);
            for (var i = props.length; i--; ) {
                if (!this.checkCssProp(props[i])) {
                    return false;
                }
            }
            return true;
        },

        supports3d: function () {
            var transformProp = this.checkCssProp('transform');
            if (!transformProp) return false;

            var elem = win.document.createElement('div');
            elem.style.cssText = transformProp + ': translate3d(0px, 0px, 0px);';
            return /transform: translate3d\(0px, 0px, 0px\);$/.test(elem.style.cssText);
        }
    };

    var defaultOpts = {
        slideSelector: 'section',
        transitionDuration: 500,
        scroll: true,
        keyboard: true,
        easing: 'ease-in-out',
        beforeMove: null,
        afterMove: null,
        jsFallback: true
    };

    var $win = $(win);
    var $doc = $(win.document);
    var $body = $doc.find('body');
    var $scrollRoot = $doc.find('html, body');


    $.fn.jetSlider = function (options) {
        if (!this.length) return;

        options = $.extend({}, defaultOpts, options);

        var $container = this;
        var $slides = $container.find(options.slideSelector);
        var currentIndex = 0;
        var slidesNum = $slides.length;
        var animating = false;
        var animationsDisabled = false;
        var moveMethod;

        if (agent.supportsProps('transition', 'transform')) {
            moveMethod = agent.supports3d() ? moveWithCss3d : moveWithCss;
            moveMethod({left: 0, top: 0});
            $container
                .css({
                    transitionDuration: options.transitionDuration / 1000 + 's',
                    transitionTimingFunction: options.easing
                });
        } else {
            moveMethod = moveWithJs;
        }

        $doc
            .on('keydown', function (evt) {
                if ($.inArray(evt.keyCode, [37, 38, 39, 40]) > -1 && evt.target == win.document.body) {
                    evt.preventDefault();
                }
            })
            .on('mousewheel DOMMouseScroll MozMousePixelScroll', function (evt) {
                evt.preventDefault();
            });

        if (options.keyboard) {
            $doc.on('keydown', keyboardHandler);
        }
        if (options.scroll) {
            $doc.on('mousewheel DOMMouseScroll MozMousePixelScroll', mouseHandler);
        }

        $win.on('resize', function () {
            $container.css({transitionDuration: '0'});
            animationsDisabled = true;
            moveMethod($slides.eq(currentIndex).position());
            animationsDisabled = false;
            if (moveMethod !== moveWithJs) {
                win.scrollTo(0, 0);
            }
        });

        $win.on('scroll', function () {
            if (moveMethod !== moveWithJs) {
                win.scrollTo(0, 0);
            }
        });

        $body.css({overflow: 'hidden'});

        $container
            .css({position: 'relative'})
            .addClass('jetslider')
            .addClass('jetslider-page-0');

        win.scrollTo(0, 0);

        // Prevent scroll jumping in Chrome
        $win.load(function () {
            setTimeout(function () {
                win.scrollTo(0, 0);  
            }, 0);
        });


        function moveTo (index) {
            if (animating) return;
            if (index < 0 || index >= slidesNum || index == currentIndex) return;
            $container.trigger('movestart', [index, currentIndex]);
            animating = true;

            moveMethod($slides.eq(index).position(), function () {
                $container
                    .removeClass($container[0].className.match(/jetslider-page-\d+/)[0])
                    .addClass('jetslider-page-' + index)
                    .trigger('moveend', [index, currentIndex]);
                currentIndex = index;
                animating = false;
            });
        }

        function moveWithCss (offset, callback) {
            $container
                .css({
                    transitionDuration: animationsDisabled ? '0s' : (options.transitionDuration/1000).toFixed(2) + 's',
                    transform: 'translate(' + -offset.left + 'px, ' + -offset.top + 'px)'
                });
            if (callback) {
                $container.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', callback);
            }
        }

        function moveWithCss3d (offset, callback) {
            $container
                .css({
                    transitionDuration: animationsDisabled ? '0s' : (options.transitionDuration/1000).toFixed(2) + 's',
                    transform: 'translate3d(' + -offset.left + 'px, ' + -offset.top + 'px, 0)'
                });
            if (callback) {
                $container.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', callback);
            }
        }

        function moveWithJs (offset, callback) { // TODO: debug
            if (animationsDisabled || !options.jsFallback) {
                win.scrollTo(offset.left, offset.top);
                if (callback) callback();
            } else {
                $scrollRoot
                    .animate({
                        scrollLeft: offset.left,
                        scrollTop: offset.top
                    }, options.transitionDuration, callback);
            }
            
        }

        function mouseHandler (evt) {
            if (animating) return;
            var delta = evt.originalEvent.wheelDelta || -evt.originalEvent.detail;
            var direction = delta > 0 ? -1 : 1;
            moveTo(currentIndex + direction);
        }

        function keyboardHandler (evt) {
            switch (evt.keyCode) {
                case 37:
                case 38:
                    if (evt.target === win.document.body) {
                        moveTo(currentIndex - 1);
                    }
                    break;
                case 39:
                case 40:
                    if (evt.target === win.document.body) {
                        moveTo(currentIndex + 1);
                    }
                    break;
            }
        }

        $container
            .on('jetslider.moveup', function () {
                moveTo(currentIndex - 1);
            })
            .on('jetslider.movedown', function () {
                moveTo(currentIndex + 1);
            })
            .on('jetslider.moveto', function (evt, index) {
                moveTo(index);
            })
            .on('jetslider.scroll', function (evt, enabled) {
                $doc[enabled ? 'on' : 'off']('mousewheel DOMMouseScroll MozMousePixelScroll', mouseHandler);
            })
            .on('jetslider.keyboard', function (evt, enabled) {
                $doc[enabled ? 'on' : 'off']('keydown', keyboardHandler);
            })
            .on('jetslider.transitionduration', function (evt, value) {
                options.transitionDuration = value;
            });

        return this;
    };

})(jQuery, this);
