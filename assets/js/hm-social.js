/* ==========================================================================
   H&M — social additions
   1) A sticky bottom action bar (TikTok + WhatsApp) for phones/tablets.
   2) A TikTok icon added to the footer social row.
   Both are idempotent and safe to run on every page.
   ========================================================================== */
(function () {
  "use strict";

  var TIKTOK = "https://www.tiktok.com/@thehmgroup";
  var WHATSAPP = "https://wa.me/447956128990";

  var TIKTOK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.78.12v-3.2a5.7 5.7 0 0 0-.78-.06 5.69 5.69 0 1 0 5.69 5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.25-1.48z"/></svg>';
  var WA_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5 14c-.2.7-1.2 1.3-1.9 1.4-.5.1-1.1.1-1.8 0-2.4-.5-4.5-1.9-6.1-3.9C5.6 11.3 5.5 8.9 6.6 7.4c.2-.3.5-.4.8-.4h.8c.2 0 .5 0 .7.5.3.7 1 2.2 1.1 2.4.1.2.1.4 0 .6-.1.2-.2.3-.4.5l-.6.6c-.2.2-.3.4-.1.7.2.4.9 1.5 1.9 2.4 1.3 1.2 2.4 1.6 2.8 1.8.3.1.5.1.7-.1l1-1.1c.2-.2.4-.3.7-.2.3 0 1.6.8 1.9 1 .3.2.5.2.6.3.1.2.1.6-.1 1z"/></svg>';
  var DIR_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.41 11.59l-9-9a2 2 0 0 0-2.83 0l-9 9a2 2 0 0 0 0 2.83l9 9a2 2 0 0 0 2.83 0l9-9a2 2 0 0 0 0-2.83zM13.5 14.5V12H10v2.5L6.5 11 10 7.5V10h5v4z"/></svg>';
  var PIN_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

  // Google Maps directions to each location (opens the Maps app on mobile)
  var LOCATIONS = [
    { name: "Store", addr: "609 Harrow Road, London W10 4RA" },
    { name: "Office", addr: "124 Wilton Road, London SW1V 1AJ" }
  ];
  function dirUrl(addr) {
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addr);
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    try {
      /* ---- 1. sticky bottom bar ---- */
      if (!document.querySelector(".hm-social-bar")) {
        var bar = document.createElement("div");
        bar.className = "hm-social-bar";
        bar.setAttribute("role", "navigation");
        bar.setAttribute("aria-label", "Quick contact");
        bar.innerHTML =
          '<button type="button" class="hm-sbtn hm-sbtn-dir" aria-haspopup="true" aria-expanded="false">' +
            DIR_SVG + "<span>Directions</span></button>" +
          '<a class="hm-sbtn hm-sbtn-wa" href="' + WHATSAPP + '" target="_blank" rel="noopener">' +
            WA_SVG + "<span>WhatsApp</span></a>";
        document.body.appendChild(bar);

        /* directions picker: tap -> choose Store/Office -> Google Maps directions */
        var pop = document.createElement("div");
        pop.className = "hm-dir-pop";
        pop.setAttribute("role", "menu");
        pop.innerHTML =
          '<p class="hm-dir-head">Get directions to</p>' +
          LOCATIONS.map(function (l) {
            return '<a class="hm-dir-item" role="menuitem" target="_blank" rel="noopener" href="' +
              dirUrl(l.addr) + '">' + PIN_SVG +
              "<span><strong>" + l.name + "</strong><small>" + l.addr + "</small></span></a>";
          }).join("");
        document.body.appendChild(pop);

        var dirBtn = bar.querySelector(".hm-sbtn-dir");
        function closePop() { pop.classList.remove("is-open"); dirBtn.setAttribute("aria-expanded", "false"); }
        function openPop() { pop.classList.add("is-open"); dirBtn.setAttribute("aria-expanded", "true"); }
        dirBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (pop.classList.contains("is-open")) closePop(); else openPop();
        });
        pop.addEventListener("click", function (e) { e.stopPropagation(); });
        pop.addEventListener("click", function (e) {
          if (e.target.closest(".hm-dir-item")) closePop();
        });
        document.addEventListener("click", closePop);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
      }

      /* ---- 2. footer TikTok icon ---- */
      var wrap = document.querySelector(".elementor-social-icons-wrapper");
      if (wrap && !wrap.querySelector(".hm-tiktok-icon")) {
        var tmpl = wrap.querySelector(".elementor-grid-item");
        var span = document.createElement("span");
        span.className = "elementor-grid-item";
        span.setAttribute("role", "listitem");
        span.innerHTML =
          '<a class="elementor-icon elementor-social-icon hm-tiktok-icon" href="' + TIKTOK +
          '" target="_blank" rel="noopener" aria-label="TikTok">' +
          '<span class="elementor-screen-only">TikTok</span>' + TIKTOK_SVG + "</a>";
        wrap.appendChild(span);
      }
    } catch (err) {
      /* non-critical: ignore */
    }
  });
})();
