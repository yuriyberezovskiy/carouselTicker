/**
 * carousel-ticker v1.0.0
 * More information visit http://likeclever1.github.io/carousel-ticker/
 * Copyright 2015, Yuriy Berezovskiy
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 * 
 * Usages: $('.carousel-ticker').carouselTicker();
 * 
 * Options:
 * - speed: integer
 * - delay: integer
 * - direction: string - "prev", "next"
 */

"use strict";

;(function($) {

    var plugin = {};

    var defaults = {
        
        // GENERAL
        direction: "prev",
        speed: 1,
        delay: 30,

        // CALLBACKS
        onSliderTickerLoad: function() {}
    };

    $.fn.carouselTicker = function(options) {
        if(this.length == 0) return this;

        // support multiple elements
        if(this.length > 1) {
            this.each(function() {
                $(this).carouselTicker(options);
            });
            return this;
        }

        // create a namespace to be throughout the plugin
        var ticker = {};
        // set a reference to our slider element
        var el = this,
            $el = $(this);

        plugin.el = this,
        plugin.$el = $(this);

        /**
         * ===================================================================================
         * = PRIVATE FUNCTIONS
         * ===================================================================================
         */

        /**
         * Initializes namespace settings to be used throughout plugin
         */
        
        var _init = function() {
            // merge user-supplied options with defaults
            ticker.settings = $.extend({}, defaults, options);
            // initialize pointer timeout
            ticker.intervalPointer = null;
            // determine direction ticker
            ticker.directionSwitcher = (ticker.settings.direction === "prev") ? -1 : 1;
            // set default value items inside ticker
            ticker.itemsWidth = 0;
            // set default value childs (items + clone)
            ticker.childsWidth = 0;
            // determine list
            ticker.$list = $el.children("ul");
            // determine items
            ticker.$items = ticker.$list.children("li");
            // initialize initialize flag
            ticker.isInitialize = false;
            // initialize mousemove flag
            ticker.isMousemove = false;
            // determine ticker parent
            ticker.$parent = $el.parent();
            // set wrapper class
            ticker.wrapCls = "carousel-ticker__wrap";
            // set clone class
            ticker.cloneCls = "carousel-ticker__clone";
            // determine touch events
            ticker.touch = ("ontouchstart" in document.documentElement) ? true : false;
            // determine event types
            ticker.eventTypes = {
                mousedown: (ticker.touch) ? "touchstart" : "mousedown",
                mousemove: (ticker.touch) ? "touchmove" : "mousemove",
                mouseup: (ticker.touch) ? "touchend" : "mouseup"
            };

            _setup();
        };

        /**
         * Performs all DOM and CSS modifications
         */
        
        var _setup = function() {
            // determine summ items width
            _calcItemsWidth();
            // if summ items width > width parent el
            if(ticker.itemsWidth > ticker.$parent.width()) {
                // check wrap element
                if($el.children().hasClass(ticker.wrapCls)) return;
                // wrap list in a wrapper
                ticker.$list.wrap("<div class='carousel-ticker__wrap'></div>");
                // clone items and push to list
                ticker.$items.clone().addClass(ticker.cloneCls).appendTo(ticker.$list);
                // add css for list
                ticker.$list.css({
                    "position": "relative",
                    "left": 0,
                    "width": ticker.itemsWidth*2
                });

                ticker.initialize = true;

                $(window).on("load", function() {
                    // delete event dragstart from link and image
                    $el.on("dragstart", function(e) {
                        if (e.target.nodeName.toUpperCase() == "IMG" || e.target.nodeName.toUpperCase() == "A") {
                            return false;
                        }
                    });

                    _start();
                });
            }
        };

        /**
         * Start the ticker
         */
        
        var _start = function() {
            // remove the loading DOM element
            // ticker.loader.remove
            // initialize resize event
            _resize();
            // start ticker-carousel
            ticker.intervalPointer = setInterval(function() {_moveTicker(), ticker.settings.delay});
            // initialize eventOver event
            _eventOver();
            // initialize eventOut event
            _eventOut();
            // initialize drag and drop event
            _eventDragAndDrop();
        };

        /**
         * Move carousel-ticker
         */

        var _moveTicker = function() {
            // step ticker moving
            ticker.$list.css("left", '+=' + ticker.directionSwitcher * ticker.settings.speed);
            // depending of direction change offset list for effect Infinity rotate
            if(ticker.settings.direction === "prev") {
                if(Math.abs(parseInt(ticker.$list.css("left"))) >= ticker.itemsWidth) {
                    ticker.$list.css("left", 0);
                }
            } else {
                if(parseInt(ticker.$list.css("left")) >= 0) {
                    ticker.$list.css("left", -self.itemsWidth);
                }
            }
        };

        /**
         * Method calc summ items width
         */
        function _calcItemsWidth() {
            // set value 0 to default
            ticker.itemsWidth = 0;
            // calc sum
            ticker.$items.each(function() {
                var $this = $(this);
                // if item clone - calc summ without it
                if($this.hasClass(ticker.cloneCls)) return;
                    ticker.itemsWidth += $this.outerWidth(true);
            });
        };

        /**
         * Event Methods _eventOver, _eventOut, _eventDragAndDrop, _resize
         */
        function _eventOver() {
            // if mouse over ticker
            $el.on("mouseover", function() {
                // if ticker width > outer width block
                if(ticker.itemsWidth > ticker.$parent.width()) {
                    // make clearInterval
                    clearInterval(ticker.intervalPointer);
                    // make clearInterval
                    ticker.intervalPointer = false;
                }
            });
        };

        function _eventOut() {
            // if mouse leave from el
            $el.on("mouseleave", function() {
                // if mouse move
                if(ticker.isMousemove) {
                    // off event behaviour mousemove
                    ticker.$list.off(ticker.eventTypes.mousemove);
                    // call event mouseup
                    ticker.$list.trigger(ticker.eventTypes.mouseup);
                }
                // if ticker width > outer width block
                if(ticker.itemsWidth > ticker.$parent.width()) {
                    // protection from double setInterval
                    if(ticker.intervalPointer) return;
                        // call _moveTicker
                        ticker.intervalPointer = setInterval(function() {_moveTicker()}, ticker.settings.delay);
                }
            });
        };

        function _eventDragAndDrop() {
            var flag = false;

            ticker.$list.on(ticker.eventTypes.mousedown, function(e) {
                var start = e.clientX || event.touches[0].pageX,
                    $this = $(this),
                    posList = $this.css("left");

                $(e.target).off("click");
                ticker.intervalPointer = false;

                ticker.$list.on(ticker.eventTypes.mousemove, function(e) {
                    var x = e.clientX || event.touches[0].pageX,
                        // fix for touch device
                        diff = start - x;

                    ticker.directionSwitcher = (diff >= 0) ? -1 : 1;
                    ticker.isMousemove = true;

                    if(flag) {
                        if(parseFloat(posList) - diff >= 0) {
                            ticker.$list.css("left", "-=" + ticker.itemsWidth);
                            posList -= ticker.itemsWidth;
                            start = e.clientX || event.touches[0].pageX;
                        }

                        if(Math.abs(parseFloat(posList)) - diff >= ticker.itemsWidth) {
                            ticker.$list.css("left", 0);
                            posList = 0;
                            start = e.clientX || event.touches[0].pageX;
                        }

                        ticker.$list.css("left", parseFloat(posList) - diff + "px");
                    }
                });
            });

            ticker.$list.on(ticker.eventTypes.mouseup, function(e) {
                var $target = $(e.target);
                e.preventDefault();

                if($target.attr("href") || $target.parents().attr("href") && ticker.isMousemove){
                    $target.on("click", function(e) {
                        e.preventDefault();
                    });
                }

                flag = false;
                ticker.isMousemove = false;
                ticker.$list.off(ticker.eventTypes.mousemove);
                
                if(ticker.intervalPointer) clearInterval(ticker.intervalPointer);
                
                if(ticker.touch) ticker.intervalPointer = setInterval(function() {_moveTicker()}, ticker.options.delay);
            });
        };

        function _resize() {

            $(window).on('resize', function() {
                ticker._calcItemsWidth();

                if(ticker.itemsWidth > ticker.$parent.width()) {
                    if(!ticker.isInitialize) ticker._init();
                } else {
                    if(ticker.isInitialize) el.destructor();
                }
            });
        };

        /**
         * Public Methods
         */
        
        /**
         * Destroy the current instance of the ticker (revert everything back to original state)
         */
        
        el.destructor = function() {
            $el.find("." + ticker.cloneCls).remove();

            if($el.find("." + self.wrapCls).length) {
                ticker.$list.unwrap();
                ticker.$list.css({'left': 'auto', 'position': 'static', 'width': 'auto'});
            }

            clearInterval(ticker.intervalPointer);
            ticker.isInitialize = false;
            ticker.intervalPointer = false;
        };

        /**
         * Reload the ticker (revert all DOM changes, and re-initialize)
         */
        el.reloadSlider = function(settings){
            if (settings != undefined) options = settings;
            el.destructor();
            _init();
        }

        _init();

        // returns the current jQuery object
        return this;
    }

})(jQuery);