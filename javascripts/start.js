(function ($, undefined) {
  $(window).on("load", function () {
    $("#carouselTicker").carouselTicker();

    var carouselForDescructor = $(
      "#carouselTicker-destructor-example"
    ).carouselTicker();

    var destroyBtn = $("#destory-carouselTicker");
    destroyBtn.on("click", function () {
      carouselForDescructor.destructor();
      destroyBtn.text("Destroyed");
    });
  });

  $(".carouselTicker-start").carouselTicker({
    direction: "next",
  });

  var carouselTickerWidthResize = $(
    "#carouselTicker-width-resize"
  ).carouselTicker();

  $(window).on("resize", function () {
    carouselTickerWidthResize.resizeTicker();
  });

  $("#carouselTicker-vertical").carouselTicker({
    mode: "vertical",
    direction: "prev",
  });

  $("#carouselTicker-vertical-with-callback").carouselTicker({
    mode: "vertical",
    direction: "next",
    onCarouselTickerLoad: function () {
      console.log("callback");
    },
  });
})(jQuery);
