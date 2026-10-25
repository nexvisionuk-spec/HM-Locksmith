/* H&M Group — renovation landing pages: before/after sliders + gallery lightbox */
(function () {
  "use strict";

  /* ---- before / after sliders ---- */
  function initSlider(root) {
    var afterWrap = root.querySelector(".hm-ba-after-wrap");
    var handle = root.querySelector(".hm-ba-handle");
    if (!afterWrap) return;
    function set(x) {
      var r = root.getBoundingClientRect();
      var pct = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      afterWrap.style.width = pct + "%";
      if (handle) handle.style.left = pct + "%";
    }
    var dragging = false;
    root.addEventListener("pointerdown", function (e) { dragging = true; set(e.clientX); });
    window.addEventListener("pointermove", function (e) { if (dragging) set(e.clientX); });
    window.addEventListener("pointerup", function () { dragging = false; });
  }
  document.querySelectorAll(".hm-ba-slider").forEach(initSlider);

  /* ---- gallery lightbox ---- */
  var figures = Array.prototype.slice.call(document.querySelectorAll(".hm-gal figure img"));
  if (figures.length) {
    var lb = document.createElement("div");
    lb.className = "hm-rn-lb";
    lb.innerHTML =
      '<button class="hm-rn-lb-x" aria-label="Close">&times;</button>' +
      '<button class="hm-rn-lb-nav hm-rn-lb-prev" aria-label="Previous">&#8249;</button>' +
      '<img alt="">' +
      '<button class="hm-rn-lb-nav hm-rn-lb-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var idx = 0;
    function show(i) {
      idx = (i + figures.length) % figures.length;
      lbImg.src = figures[idx].src;
      lbImg.alt = figures[idx].alt || "";
    }
    function open(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    figures.forEach(function (img, i) { img.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".hm-rn-lb-x").addEventListener("click", close);
    lb.querySelector(".hm-rn-lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector(".hm-rn-lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });
  }
})();
