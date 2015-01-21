/**
 * carousel-ticker by Yuriy Berezovskiy
 * The MIT License (MIT)
 * Usage $('.carousel-ticker').carouselTicker();
 * Options:
 * - speed: integer
 * - delay: integer
 * - reverse: boolean
 *
 * More information visit http://likeclever1.github.io/carousel-ticker/
 */

"use strict";

(function($) {

    $.carouselTicker = function (el, settings) {
        this.settings = settings;
        this.itemsWidth = 0;
        this.timeout = null;
        this.$el = $(el);
        this.direction = -1;
        this.cloneCls = this.$el.attr("class") + '__clone';
        this.listCls = this.$el.attr("class") + "__list";
        this.itemsCls = this.$el.attr("class") + "__item";
        this.wrapCls = this.$el.attr("class") + "__wrap";
        this.linkCls = this.$el.attr("class") + "__link";
        this.childsWidth = 0;
        this.initialize = false;
        this.cloneChildsWidth = 0;
        this.$parent = this.$el.parent();
        this.defaults = {
            speed: 1,
            delay: 30,
            reverse: false
        };

        this.touch = ('ontouchstart' in document.documentElement) ? true : false;
        // Events
        this.eventTypes = {
            mousedown: (!this.touch) ? "mousedown" : "touchstart",
            mousemove: (!this.touch) ? "mousemove" : "touchmove",
            mouseup: (!this.touch) ? "mouseup" : "touchend"
        }

        this.mousemove = false;

        this.init();
        this.resize();
    };

    $.carouselTicker.prototype = {
        init: function() {
            var self = this,
                $this = self.$el,
                $items = $this.find("." + self.itemsCls),
                $list = $this.find("." + self.listCls);

            self.options = $.extend({}, self.defaults, self.settings);
        
            if($this.children().hasClass('self.wrapCls')) return;

            self._calcItemsWidth();

            if(self.itemsWidth > self.$parent.width()) {
                self.direction = (self.options.reverse) ? 1 : -1;

                $items.each(function() {

                    self.initialize = true;

                    var $that = $(this),
                        clone;
                    
                    // if drag for a or img have tarouble, fix it
                    $this.on("dragstart", function(e) {
                         if (e.target.nodeName.toUpperCase() == "IMG" || e.target.nodeName.toUpperCase() == "A") {
                             return false;
                         }
                    });

                    if($that.hasClass(self.cloneCls)) return;
                        clone = $that.clone();
                        clone.addClass(self.cloneCls).appendTo($list);
                });
                $this.find("." + self.listCls).css({
                    'position': 'relative',
                    'left': 0,
                    'width': self.itemsWidth + self.cloneWidth
                }).wrap("<div class=" + self.wrapCls + "></div>");

                self.timeout = setInterval(function() {self._moveCarousel()}, self.options.delay);
                self._eventOver();
                self._eventOut();
                self._eventDragAndDrop();
            }
        },

        _calcItemsWidth: function() {
            var self = this,
                opt = self.options,
                $this = self.$el,
                items = $this.find("." + self.itemsCls);

            self.itemsWidth = 0;

            items.each(function() {
                var $this = $(this);
                if($this.hasClass(self.cloneCls)) return;
                        self.itemsWidth += $this.outerWidth(true);
            });

            self.cloneWidth = self.itemsWidth;
        },

        _moveCarousel: function() {
            var self = this,
                opt = self.options,
                $this = self.$el,
                $list = $this.find("." + self.listCls);

            $list.css("left", '+=' + self.direction*opt.speed);

            if(self.direction == -1) {
                if(Math.abs(parseInt($list.css("left"))) >= self.itemsWidth) {
                    $list.css("left", 0);

                }
            } else {
                if(parseInt($list.css("left")) >= 0) {
                    $list.css("left", -self.itemsWidth);
                }
            }
        },

        _eventOver: function() {
            var self = this,
                opt = self.options,
                $this = self.$el;

            $this.on("mouseover", function() {
                if(self.itemsWidth > self.$parent.width()) {
                    clearInterval(self.timeout);
                    self.timeout = false;
                }
            });
        },

        _eventOut: function() {
            var self = this,
                opt = self.options,
                $this = self.$el,
                $list = $this.find("." + self.listCls);

            $this.on("mouseleave", function() {
                if(self.mousemove) {
                    $list.off(self.eventTypes.mousemove);
                    $list.trigger(self.eventTypes.mouseup);
                }

                if(self.itemsWidth > self.$parent.width()) {
                    if(self.timeout) return;
                        self.timeout = setInterval(function() {self._moveCarousel()}, self.options.delay);
                }
            });
        },

        _eventDragAndDrop: function() {
            var self = this,
                opt = self.options,
                $this = self.$el,
                flag = false,
                $list = $this.find("." + self.listCls);

            $list.on(self.eventTypes.mousedown, function(e) {
                var start = e.clientX || event.touches[0].pageX,
                    startLeft = $list.css("left");
                $(e.target).off("click");
                flag = true;

                clearInterval(self.timeout);
                self.timeout = false;

                $list.on(self.eventTypes.mousemove, function(e) {
                    var offsetX = e.clientX || event.touches[0].pageX,
                        merg = start - offsetX; // fix for touch device
                    
                    self.direction = (merg >= 0) ? -1 : 1;
                    self.mousemove = true;

                    if(flag) {
                        if(parseFloat(startLeft) - merg >= 0) {
                            $list.css("left", "-=" + self.itemsWidth);
                            startLeft = -self.itemsWidth;
                            start = e.clientX || event.touches[0].pageX;
                        }

                        if(Math.abs(parseFloat(startLeft) - merg) >= self.itemsWidth) {
                            $list.css("left", 0);
                            startLeft = 0;
                            start = e.clientX || event.touches[0].pageX;
                        }

                        $list.css("left", parseFloat(startLeft) - merg + "px");
                    }

                });
            });
            
            $list.on(self.eventTypes.mouseup, function(e) {
                e.preventDefault();

                if($(e.target).attr("href") || $(e.target).parents().attr("href") && self.mousemove){
                    $(e.target).on("click", function(e) {
                        e.preventDefault();
                    });
                }

                flag = false;
                self.mousemove = false;
                $list.off(self.eventTypes.mousemove);
                
                if(self.timeout) clearInterval(self.timeout);
                
                if(self.touch) self.timeout = setInterval(function() {self._moveCarousel()}, self.options.delay);
            });
        },

        resize: function() {
            var self = this,
                opt = self.options,
                $this = self.$el;

            $(window).on('resize', function() {
                self._calcItemsWidth();
                if(self.$parent.width() < self.itemsWidth) {
                    if(!self.initialize) self.init();
                } else {
                    if(self.initialize) self._destructor();
                }
            });
        },

        _destructor: function() {
            var self = this,
                opt = self.options,
                $this = self.$el,
                $list = $this.find("." + self.listCls);

            $this.find("." + self.cloneCls).remove();

            if($this.find("." + self.wrapCls).length) {
                $list.unwrap();
                $list.css({'left': 'auto', 'position': 'static', 'width': 'auto'});
            }

            clearInterval(self.timeout);
            self.initialize = false;
            self.timeout = false;
        }
    };

    $.fn.carouselTicker = function(settings) {
        return this.each(function() {
            new $.carouselTicker(this, settings);
        });
    };

})(jQuery);