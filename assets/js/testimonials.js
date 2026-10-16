/* H&M Group — testimonial carousel
   Turns each .hm-testimonials grid into a single-card slider with arrows
   and dots. Progressive enhancement: if JS is off the grid still shows. */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.hmCarousel) return;
    root.dataset.hmCarousel = "1";

    var cards = Array.prototype.slice.call(root.querySelectorAll(":scope > .hm-t-card"));
    if (!cards.length) return;

    var row = document.createElement("div");
    row.className = "hm-t-row";

    var prev = document.createElement("button");
    prev.className = "hm-t-arrow prev";
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous review");
    prev.innerHTML = "&#8249;";

    var next = document.createElement("button");
    next.className = "hm-t-arrow next";
    next.type = "button";
    next.setAttribute("aria-label", "Next review");
    next.innerHTML = "&#8250;";

    var viewport = document.createElement("div");
    viewport.className = "hm-t-viewport";
    var track = document.createElement("div");
    track.className = "hm-t-track";
    cards.forEach(function (c) { track.appendChild(c); });
    viewport.appendChild(track);

    row.appendChild(prev);
    row.appendChild(viewport);
    row.appendChild(next);
    root.appendChild(row);

    var dotsWrap = document.createElement("div");
    dotsWrap.className = "hm-t-dots";
    var dots = cards.map(function (_, k) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to review " + (k + 1));
      b.addEventListener("click", function () { go(k); });
      dotsWrap.appendChild(b);
      return b;
    });
    root.appendChild(dotsWrap);

    var i = 0;
    function go(n) {
      i = (n + cards.length) % cards.length;
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    }
    prev.addEventListener("click", function () { go(i - 1); });
    next.addEventListener("click", function () { go(i + 1); });

    // swipe on touch
    var sx = 0;
    root.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    }, { passive: true });

    go(0);
  }

  function run() {
    document.querySelectorAll(".hm-testimonials").forEach(init);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
