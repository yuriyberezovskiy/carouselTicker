/**
 * carouselTicker v1.0.0
 * More information visit http://likeclever1.github.io/carouselTicker/
 * Copyright 2015, Yuriy Berezovskiy
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 *
 * Usages: $(...).carouselTicker();
 *
 * Options:
 * - speed: integer
 * - delay: integer
 * - direction: string - "prev", "next"
 */

"use strict";

(function ($) {
  var defaults = {
    // GENERAL
    direction: "prev",
    mode: "horizontal",
    speed: 1,
    delay: 30,

    // CALLBACKS
    onCarouselTickerLoad: function () {},
  };

  $.fn.carouselTicker = function (options) {
    if (this.length == 0) return this;

    // support multiple elements
    if (this.length > 1) {
      this.each(function () {
        $(this).carouselTicker(options);
      });
      return this;
    }

    // create a namespace to be throughout the plugin
    var ticker = {};
    // set a reference to our slider element
    var el = this,
      $el = $(this);

    /**
     * ===================================================================================
     * = PRIVATE FUNCTIONS
     * ===================================================================================
     */

    /**
     * Initializes namespace settings to be used throughout plugin
     */

    var _init = function () {
      // merge user-supplied options with defaults
      ticker.settings = $.extend({}, defaults, options);
      // initialize pointer timeout
      ticker.intervalPointer = null;
      // determine direction ticker
      ticker.directionSwitcher = ticker.settings.direction === "prev" ? -1 : 1;
      // set default value items inside ticker
      ticker.itemsWidth = 0;
      // set default value childs (items + clone)
      ticker.childsWidth = 0;
      // set default value items inside ticker
      ticker.itemsHeight = 0;
      // set default value childs (items + clone)
      ticker.childsHeight = 0;
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
      ticker.wrapCls = "carouselTicker__wrap";
      // set list class
      ticker.listCls = "carouselTicker__list";
      // set loader class
      ticker.loaderCls = "carouselTicker__loader";
      // set clone class
      ticker.cloneCls = "carouselTicker__clone";
      // determine touch events
      ticker.touch = "ontouchstart" in document.documentElement ? true : false;
      // determine event types
      ticker.eventTypes = {
        mousedown: ticker.touch ? "touchstart" : "mousedown",
        mousemove: ticker.touch ? "touchmove" : "mousemove",
        mouseup: ticker.touch ? "touchend" : "mouseup",
      };

      _setup();
    };

    /**
     * Performs all DOM and CSS modifications
     */

    var _setup = function () {
      // if horizontal mode
      if (ticker.settings.mode === "horizontal") {
        // determine summ items width
        _calcItemsWidth();
        // if summ items width > width parent el
        if (ticker.itemsWidth > ticker.$parent.width()) {
          // set new width
          $el
            .find("." + ticker.wrapCls)
            .css({ width: ticker.$parent.width() + "px" });
          ticker.$list.css({ width: ticker.itemsWidth * 2, left: 0 });
          // set common parameters
          setupFunc();
        }
        // if vertical mode
      } else if (ticker.settings.mode === "vertical") {
        // determine summ items height
        _calcItemsHeight();
        // if summ items height > height parent el
        if (ticker.itemsHeight > ticker.$parent.height()) {
          // set new height
          $el
            .find("." + ticker.wrapCls)
            .css({ height: ticker.$parent.height() + "px" });
          ticker.$list.css({ height: ticker.itemsHeight * 2, top: 0 });
          // set common parameters
          setupFunc();
        }
      }

      if (ticker.isInitialize) {
        // delete event dragstart from link and image
        $el.on("dragstart", function (e) {
          if (
            e.target.nodeName.toUpperCase() == "IMG" ||
            e.target.nodeName.toUpperCase() == "A"
          ) {
            return false;
          }
        });
      }

      function setupFunc() {
        // check wrap el
        if ($el.children().hasClass(ticker.wrapCls)) return;
        // add loader
        $("<div class='" + ticker.loaderCls + "'></div>").appendTo($el);
        // set css to element
        $el.find("." + ticker.wrapCls).css({ position: "relative" });
        // wrap list in a wrapper
        ticker.$list.wrap(
          "<div class='carouselTicker__wrap' style='position: relative; overflow: hidden; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none;'></div>"
        );
        // clone items and push to list
        ticker.$items.clone().addClass(ticker.cloneCls).appendTo(ticker.$list);
        // add css for list
        ticker.$list.css({
          position: "relative",
        });

        // set true to initialize value
        ticker.isInitialize = true;
        // onSliderLoad callback
        ticker.settings.onCarouselTickerLoad();
        // start add functionality
        _start();
      }
    };

    /**
     * Start the ticker
     */

    var _start = function () {
      // remove the loading DOM element
      if ($el.find("." + ticker.loaderCls).length)
        $el.find("." + ticker.loaderCls).remove();
      // start ticker-carousel
      ticker.intervalPointer = setInterval(function () {
        _moveTicker();
      }, ticker.settings.delay);
      // initialize eventOver event
      $el.on("mouseover", _eventOver);
      // initialize eventOut event
      $el.on("mouseleave", _eventOut);
      // initialize drag and drop event
      _eventDragAndDrop();
    };

    /**
     * Move carouselTicker
     */

    var _moveTicker = function () {
      var mode = ticker.settings.mode === "horizontal" ? "left" : "top",
        itemsSize =
          ticker.settings.mode === "horizontal"
            ? ticker.itemsWidth
            : ticker.itemsHeight;
      // step ticker moving
      ticker.$list.css(
        mode,
        "+=" + ticker.directionSwitcher * ticker.settings.speed + "px"
      );
      // depending of direction change offset list for effect Infinity rotate
      if (ticker.settings.direction === "prev") {
        if (Math.abs(parseInt(ticker.$list.css(mode))) >= itemsSize) {
          ticker.$list.css(mode, 0);
        }
      }

      if (ticker.settings.direction === "next") {
        if (parseInt(ticker.$list.css(mode)) >= 0) {
          ticker.$list.css(mode, -itemsSize + "px");
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
      ticker.$items.each(function () {
        var $this = $(this),
          style = this.currentStyle || window.getComputedStyle(this),
          margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        // if item clone - calc summ without it
        if ($this.hasClass(ticker.cloneCls)) return;
        ticker.itemsWidth += this.getBoundingClientRect().width + margin;
      });
    }

    /**
     * Method calc summ items height
     */
    function _calcItemsHeight() {
      // set value 0 to default
      ticker.itemsHeight = 0;
      // calc sum
      ticker.$items.each(function () {
        var $this = $(this);
        // if item clone - calc summ without it
        if ($this.hasClass(ticker.cloneCls)) return;
        ticker.itemsHeight += $this.outerHeight(true);
      });
    }

    /**
     * Event Methods _eventOver, _eventOut, _eventDragAndDrop
     */
    function _eventOver() {
      // depending from mode choose condition
      var condition =
        ticker.settings.mode === "horizontal"
          ? ticker.itemsWidth > ticker.$parent.width()
          : ticker.itemsHeight > ticker.$parent.height();
      // if ticker width/height > outer width/height block
      if (condition) {
        // make clearInterval
        clearInterval(ticker.intervalPointer);
        // make clearInterval
        ticker.intervalPointer = false;
      }
    }

    function _eventOut() {
      // depending from mode choose condition
      var condition =
        ticker.settings.mode === "horizontal"
          ? ticker.itemsWidth > ticker.$parent.width()
          : ticker.itemsHeight > ticker.$parent.height();
      // if mouse move
      if (ticker.isMousemove) {
        // off event behaviour mousemove
        ticker.$list.off(ticker.eventTypes.mousemove);
        // call event mouseup
        ticker.$list.trigger(ticker.eventTypes.mouseup);
      }
      // if ticker width > outer width block
      if (condition) {
        // protection from double setInterval
        if (ticker.intervalPointer) return;
        // call _moveTicker
        ticker.intervalPointer = setInterval(function () {
          _moveTicker();
        }, ticker.settings.delay);
      }
    }

    function _eventDragAndDrop() {
      var flag = false;

      ticker.$list.on(ticker.eventTypes.mousedown, function (e) {
        var start = e.clientX || event.touches[0].pageX,
          startY = e.clientY || event.touches[0].pageY,
          $this = $(this),
          posList = parseFloat($(this).css("left")),
          posListY = parseFloat($(this).css("top"));

        $(e.target).off("click");
        clearInterval(ticker.intervalPointer);
        ticker.intervalPointer = false;
        flag = true;

        $this.on(ticker.eventTypes.mousemove, function (e) {
          var x = e.clientX || event.touches[0].pageX,
            y = e.clientY || event.touches[0].pageY,
            // fix for touch device
            diff = start - x,
            diffY = startY - y;

          if (ticker.touch) {
            $(document).on("touchmove", function (e) {
              e.preventDefault();
            });
          }

          if (ticker.settings.mode === "horizontal") {
            ticker.directionSwitcher = diff >= 0 ? -1 : 1;
          } else if (ticker.settings.mode === "vertical") {
            ticker.directionSwitcher = diffY >= 0 ? -1 : 1;
          }

          ticker.isMousemove = true;

          if (flag) {
            if (ticker.settings.mode === "horizontal") {
              // if drag more left side
              if (posList - diff >= 0 && ticker.directionSwitcher === 1) {
                $this.css("left", "-=" + ticker.itemsWidth);
                posList = -ticker.itemsWidth;
                start = e.clientX || event.touches[0].pageX;
                diff = 0;
              }
              // if drag more right side
              if (
                posList - diff <= -ticker.itemsWidth &&
                ticker.directionSwitcher === -1
              ) {
                $this.css("left", 0);
                posList = 0;
                diff = 0;
                start = e.clientX || event.touches[0].pageX;
              }

              $this.css("left", posList - diff + "px");
            } else if (ticker.settings.mode === "vertical") {
              // if drag more top side
              if (posListY - diffY >= 0 && ticker.directionSwitcher === 1) {
                $this.css("top", "-=" + ticker.itemsHeight);
                posListY = -ticker.itemsHeight;
                startY = e.clientY || event.touches[0].pageY;
                diffY = 0;
              }
              // if drag more right side
              if (
                posListY - diffY <= -ticker.itemsHeight &&
                ticker.directionSwitcher === -1
              ) {
                $this.css("top", 0);
                posListY = 0;
                diffY = 0;
                startY = e.clientY || event.touches[0].pageY;
              }

              $this.css("top", posListY - diffY + "px");
            }
          }
        });
      });

      ticker.$list.on(ticker.eventTypes.mouseup, function (e) {
        var $target = $(e.target);

        if (
          $target.attr("href") ||
          ($target.parents().attr("href") && ticker.isMousemove)
        ) {
          e.preventDefault();
          $target.on("click", function (e) {
            e.preventDefault();
          });
        }

        flag = false;
        ticker.isMousemove = false;
        ticker.settings.direction =
          ticker.directionSwitcher === 1 ? "next" : "prev";
        $(this).off(ticker.eventTypes.mousemove);

        if (ticker.touch) {
          $(document).off("touchmove");
        }

        if (ticker.intervalPointer) clearInterval(ticker.intervalPointer);

        if (ticker.touch)
          ticker.intervalPointer = setInterval(function () {
            _moveTicker();
          }, ticker.settings.delay);
      });
    }

    /**
     * Public Methods
     */

    /**
     * resize carouselTicker
     *
     **/

    el.resizeTicker = function () {
      _calcItemsWidth();

      if (ticker.itemsWidth > ticker.$parent.width()) {
        if (!ticker.isInitialize) {
          _init();
        }
      } else {
        if (ticker.isInitialize) el.destructor();
      }
    };

    /**
     * Stop rotate carouselTicker
     */

    el.stop = function () {
      $el.off("mouseover", _eventOver);
      $el.off("mouseleave", _eventOut);

      clearInterval(ticker.intervalPointer);
      ticker.intervalPointer = false;
    };

    /**
     * Run carouselTicker
     */

    el.run = function () {
      _start();
    };

    /**
     * Destroy the current instance of the ticker (revert everything back to original state)
     */

    el.destructor = function () {
      var $clones = $el.find("." + ticker.cloneCls);
      // remove all clone items from dom
      $clones.remove();

      var $tickerWrapper = $el.find("." + ticker.wrapCls);

      if ($tickerWrapper.length) {
        var $list = $el.find("." + ticker.listCls);
        $list.unwrap();
        $list.css({ left: "auto", position: "static", width: "auto" });
        $el.css({ width: "auto", position: "static" });
      }

      el.stop();
      ticker.isInitialize = false;
    };

    /**
     * Reload the ticker (revert all DOM changes, and re-initialize)
     */
    el.reloadCarouselTicker = function (settings) {
      if (settings != undefined) options = settings;
      el.destructor();
      _init();
    };

    /**
     * Start rotate to next direction
     */
    el.next = function () {
      el.stop();
      ticker.settings.direction = "next";
      ticker.directionSwitcher = ticker.settings.direction === "prev" ? -1 : 1;
      el.run();
    };

    /**
     * Start rotate to prev direction
     */
    el.prev = function () {
      el.stop();
      ticker.settings.direction = "prev";
      ticker.directionSwitcher = ticker.settings.direction === "prev" ? -1 : 1;
      el.run();
    };

    if (document.readyState === "loading") {
      $(window).on("load", function () {
        _init();
      });
    } else {
      _init();
    }

    // returns the current jQuery object
    return this;
  };
})(jQuery);
