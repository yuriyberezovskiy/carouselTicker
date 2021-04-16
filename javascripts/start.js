(function ($, undefined) {
  $(window).on("load", function () {
    $("#carouselTicker").carouselTicker();

    var carouselForDescructor = $(
      "#carouselTicker-destructor-example"
    ).carouselTicker();

    var destroyBtn = $("#destory-carouselTicker");
    var carouselForDescructorRunning = true;

    destroyBtn.on("click", function () {
      if (carouselForDescructorRunning) {
        carouselForDescructor.destructor();
        carouselForDescructorRunning = false;
        $(this).text("Start");
      } else {
        carouselForDescructor = $(
          "#carouselTicker-destructor-example"
        ).carouselTicker();
        carouselForDescructorRunning = true;
        $(this).text("Destroy");
      }
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

  /**
   * Start Carousel with buttons control
   */
  var carouselTickerButtonsControls = $(
    "#carouselTicker-buttons-controls-example"
  ).carouselTicker();

  var buttonPrev = $("#carouselTicker-buttons-controls-prev");
  var buttonNext = $("#carouselTicker-buttons-controls-next");
  var buttonStop = $("#carouselTicker-buttons-controls-stop");

  buttonPrev.on("click", function () {
    carouselTickerButtonsControls.prev();
  });

  buttonNext.on("click", function () {
    carouselTickerButtonsControls.next();
  });

  buttonStop.on("click", function () {
    carouselTickerButtonsControls.stop();
  });
  /**
   * End Carousel with buttons control
   */
})(jQuery);
