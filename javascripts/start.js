(function ($, undefined) {
    
    $(".carouselTicker").carouselTicker();
    $(".carouselTickerVertical").carouselTicker({
        "mode": "vertical",
        "direction": "next"
    });

    $(".carouselTickerVertical1").carouselTicker({
        "mode": "vertical",
        "direction": "prev"
    });

    $(window).on('resize', function() {
        $(".carouselTicker").carouselTicker().resize();
    });

})(jQuery);