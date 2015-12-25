/*
*  jetSlider v1.0.1
*  Simple plugin for making beautiful page transitions
*  Copyright 2014 DevHub, Pavel Gavrilenko
*  Examples and docs: https://github.com/gavr-pavel/jetSlider
*/
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var agent = {
        checkCssProp: function (prop) {
            var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
            var elem = document.createElement('div');

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

            var elem = document.createElement('div');
            elem.style.cssText = transformProp + ': translate3d(0px, 0px, 0px);';
            return /transform: translate3d\(0px, 0px, 0px\);$/.test(elem.style.cssText);
        }
    };

    function getOptsFromAttrs ($element) {
        var optionList = ['slideSelector', 'transitionDuration', 'scroll', 'keyboard', 'easing', 'jsFallback'];
        var options = {};
        $.each(optionList, function (i, option) {
            options[option] = $element.data(option);
        });
        return options;
    }


    function JetSlider (elem, options) {
        var self = this;
        this._$win = $(window);
        this._$doc = $(document);
        this._$body = $(document.body);
        this._el = elem;
        this._$el = $(elem);

        this.options = $.extend({}, $.fn.jetSlider.defaults, getOptsFromAttrs(this._$el), options);

        if (this._$el.parent().is(this._$body)) {
            this._$viewport = $('html,body');
            this._$body.css({overflow: 'hidden'});
            /* jshint eqnull:true */
            if (this.options.keyboard == null) {
                this.options.keyboard = true;
            }
        } else {
            this._$viewport = this._$el.parent();
            this._$viewport.css({overflow: 'hidden'});
        }

        this._$viewport
            .scrollLeft(0)
            .scrollTop(0);

        this._$el
            .css({position: 'relative'})
            .addClass('jetslider');

        if (!/loaded|complete/.test(document.readyState)) {
            this._$win.one('load', function () {
                setTimeout(function () {
                    self._$viewport.scrollLeft(0).scrollTop(0);
                }, 0);
            });
        }

        this._$slides = this._$el.find(this.options.slideSelector);
        this._slidesNum = this._$slides.length;

        this._currentIndex = 0;
        this._animating = false;
        this._animationsDisabled = false;

        this._initHandlers();

    }


    if (agent.supportsProps('transition', 'transform')) {

        JetSlider.prototype._moveMethod = 'css';

        JetSlider.prototype._3dSupport = agent.supports3d();

        JetSlider.prototype._move = function ($elem, callback) {
            var offset = $elem.position();
            var viewportRect = this._$viewport[0].getBoundingClientRect();
            var slideRect = $elem[0].getBoundingClientRect();

            if (slideRect.width < viewportRect.width) {
                offset.left -= viewportRect.width - slideRect.width;
            }
            if (slideRect.height < viewportRect.height) {
                offset.top -= viewportRect.height - slideRect.height;
            }

            var transformString;
            if (this._3dSupport) {
                transformString = 'translate3d(' + -offset.left + 'px, ' + -offset.top + 'px, 0)';
            } else {
                transformString = 'translate(' + -offset.left + 'px, ' + -offset.top + 'px)';
            }
            this._$el
                .css({
                    transitionDuration: this._animationsDisabled ? '0s' : (this.options.transitionDuration/1000).toFixed(2) + 's',
                    transitionTimingFunction: this.options.easing,
                    transform: transformString,
                    backfaceVisibility: 'hidden'
                });
            if (callback) {
                this._$el.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', callback);
            }
        };

    } else {

        JetSlider.prototype._moveMethod = 'js';

        JetSlider.prototype._move = function ($elem, callback) {
            var offset = $elem.offset();
            if (this._animationsDisabled || !this.options.jsFallback) {
                this._$viewport
                    .scrollLeft(offset.left)
                    .scrollTop(offset.top);
                if (callback) callback();
            } else {
                // more smooth scroll animtaion than jQuery's
                var self = this;
                var started = Date.now();
                var duration = this.options.transitionDuration;
                var initialLeft = this._$viewport.scrollLeft();
                var initialTop = this._$viewport.scrollTop();
                var delta = $.easing.swing;
                (function tick () {
                    var progress = (Date.now() - started) / duration;
                    if (progress < 1) {
                        var left = initialLeft + Math.round((offset.left-initialLeft) * delta(progress));
                        var top = initialTop + Math.round((offset.top-initialTop) * delta(progress));
                        self._$viewport.scrollLeft(left).scrollTop(top);
                        setTimeout(tick, 16);
                    } else {
                        self._$viewport.scrollLeft(offset.left).scrollTop(offset.top);
                        if (callback) callback();
                    }
                })();
            }
        };

    }

    JetSlider.prototype.moveTo = function (index) {
        if (this._animating) return;
        if (index < 0 || index >= this._slidesNum || index == this._currentIndex) return;
        if ($.isFunction(this.options.onBeforeMove)) {
            this.options.onBeforeMove.call(this._el, index, this._currentIndex);
        }
        this._animating = true;
        this._$el.css({pointerEvents: 'none'});

        this._move(this._$slides.eq(index), $.proxy(function () {
            if ($.isFunction(this.options.onAfterMove)) {
                this.options.onAfterMove.call(this._el, index, this._currentIndex);
            }
            this._currentIndex = index;
            this._animating = false;
            this._$el.css({pointerEvents: ''});
            this._lastAnimationEnded = Date.now();
            if (this._resizeHandleNeeded) {
                this._resizeHandler();
                this._resizeHandleNeeded = false;
            }
        }, this));
    };

    JetSlider.prototype.moveUp = function () {
        this.moveTo(this._currentIndex - 1);
    };

    JetSlider.prototype.moveDown = function () {
        this.moveTo(this._currentIndex + 1);
    };

    JetSlider.prototype.setOption = function (option, value) {
        this.options[option] = value;
    };

    JetSlider.prototype._initHandlers = function () {
        this._resizeHandler = $.proxy(this._resizeHandler, this);
        this._keyHandler = $.proxy(this._keyHandler, this);
        this._mouseHandler = $.proxy(this._mouseHandler, this);
        this._touchStartHandler = $.proxy(this._touchStartHandler, this);
        this._touchMoveHandler = $.proxy(this._touchMoveHandler, this);

        this._$win.on('resize', this._resizeHandler);
        this._$doc.on('keydown', this._keyHandler);
        this._$viewport
            .on('mousewheel DOMMouseScroll MozMousePixelScroll', this._mouseHandler)
            .on('touchstart', this._touchStartHandler)
            .on('touchmove', this._touchMoveHandler);

        (this._$viewport.is(this._$body) ? this._$win : this._$viewport)
            .on('scroll', this._scrollHandler);

    };

    JetSlider.prototype._scrollHandler = function () {
        if (this._moveMethod === 'css') {
            this._$viewport
                .scrollLeft(0)
                .scrollTop(0);
        }
    };

    JetSlider.prototype._resizeHandler = function () {
        this._scrollHandler();

        if (this._animating) {
            this._resizeHandleNeeded = true;
        } else {
            this._animationsDisabled = true;
            this._move(this._$slides.eq(this._currentIndex));
            this._animationsDisabled = false;
        }
    };

    JetSlider.prototype._mouseHandler = function (evt) {
        evt.preventDefault();
        if (!this.options.scroll) return;
        if (this._animating) return;
        // 1500 ms delay after last mousewheel event is needed to prevent odd scroll
        if ((Date.now() - this._lastAnimationEnded) < (1500 - this.options.transitionDuration)) return;
        var delta = evt.originalEvent.wheelDelta || -evt.originalEvent.detail;
        var direction = delta > 0 ? -1 : 1;
        this.moveTo(this._currentIndex + direction);
    };

    JetSlider.prototype._keyHandler = function (evt) {
        if (!this.options.keyboard) return;
        switch (evt.keyCode) {
            case 37:
            case 38:
                if (this._$body.is(evt.target)) {
                    evt.preventDefault();
                    this.moveTo(this._currentIndex - 1);
                }
                break;
            case 39:
            case 40:
                if (this._$body.is(evt.target)) {
                    evt.preventDefault();
                    this.moveTo(this._currentIndex + 1);
                }
                break;
        }
    };

    JetSlider.prototype._touchStartHandler = function (evt) {
        evt.preventDefault();
        var touch = evt.originalEvent.touches[0];
        this._touchStartedAt = {
            x: touch.pageX,
            y: touch.pageY
        };
    };

    JetSlider.prototype._touchMoveHandler = function (evt) {
        evt.preventDefault();
        if (this._animating) return;
        var touch = evt.originalEvent.touches[0];
        var dX = touch.pageX - this._touchStartedAt.x;
        var dY = touch.pageY - this._touchStartedAt.y;
        if (dX > 50 || dY > 50) {
            this.moveUp();
        } else if (dX < -50 || dY < -50 ) {
            this.moveDown();
        }
    };

    JetSlider.prototype.destroy = function () {
        this._$el.css({
            position: '',
            transition: '',
            transform: '',
            backfaceVisibility: ''
        });

        this._$el.removeClass('jetslider');

        this._$viewport.css({overflow: ''});

        this._$viewport
            .off('mousewheel DOMMouseScroll MozMousePixelScroll', this._mouseHandler)
            .off('touchstart', this._touchStartHandler)
            .off('touchmove', this._touchMoveHandler);

        this._$win.off('resize', this._resizeHandler);
        this._$doc.off('keydown', this._keyHandler);

        (this._$viewport.is(this._$body) ? this._$win : this._$viewport)
            .off('scroll', this._scrollHandler);

        $.removeData(this._el, 'plugin_jetslider');
    };


    $.fn.jetSlider = function () {
        if (typeof arguments[0] === 'string') {
            var args = [].slice.call(arguments);
            return this.each(function () {
                var instance = $.data(this, 'plugin_jetslider');
                if (!instance) return;
                switch (args[0].toLowerCase()) {
                    case 'moveup':
                        instance.moveUp();
                        break;
                    case 'movedown':
                        instance.moveDown();
                        break;
                    case 'moveto':
                        instance.moveTo(args[1]);
                        break;
                    case 'destroy':
                        instance.destroy();
                        break;
                    default:
                        instance.setOption(args[0], args[1]);
                }
            });

        } else {

            var options = arguments[0];
            return this.each(function () {
                var instance = new JetSlider(this, options);
                $.data(this, 'plugin_jetslider', instance);
            });

        }

    };


    $.fn.jetSlider.defaults = {
        slideSelector: 'section',
        transitionDuration: 1000,
        scroll: true,
        keyboard: null,
        easing: 'ease',
        jsFallback: true,
        onBeforeMove: null,
        onAfterMove: null
    };


    $(function () {
        $('[data-jetslider]').jetSlider();
    });

});
