(function ($, undefined) {

    $(window).on("load", function() {
        $("#carouselTicker").carouselTicker();
    })
    
    $("#carouselTicker1").carouselTicker({
        "direction": "next"
    });

    $("#carouselTicker1").carouselTicker({
        "direction": "next"
    });

    $(".carouselTicker-start").carouselTicker({
        "direction": "next"
    });

    var carouselTickerWidthResize = $("#carouselTicker-width-resize").carouselTicker();

    $(window).on('resize', function() {
        carouselTickerWidthResize.resizeTicker();
    });

    $("#carouselTicker-vertical").carouselTicker({
        "mode": "vertical",
        "direction": "prev"
    });
    
    $("#carouselTicker-vertical-with-callback").carouselTicker({
        "mode": "vertical",
        "direction": "next",
        "onCarouselTickerLoad": function() {console.log("callback")}
    });

})(jQuery);