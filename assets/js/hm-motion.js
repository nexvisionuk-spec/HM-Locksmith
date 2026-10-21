/* ==========================================================================
   H&M — scroll-reveal motion
   Elementor's own entrance animations never fire on this static export (every
   element keeps .elementor-invisible but renders at opacity 1), so the whole
   site felt flat on scroll. This adds one lightweight, tasteful reveal layer:
   content fades + rises into view, staggered per group, with a gentle zoom on
   imagery. Pure vanilla + IntersectionObserver, no dependencies.

   Safety:
   - Does nothing when the visitor prefers reduced motion.
   - Content is NEVER left hidden: any failure reveals everything immediately.
   - Header, footer and the mobile menu are excluded so navigation never moves.
   ========================================================================== */
(function () {
  "use strict";

  // Respect the visitor's motion preference — CSS keeps everything visible.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var EXCLUDE =
    ".top_panel, header, footer, .footer_wrap, " +
    ".trx-addons-mobile-menu-outer-container, " +
    ".elementor-location-header, .elementor-location-footer";

  // Leaf-level content widgets + our own custom blocks.
  var SELECTOR = [
    ".elementor-widget-heading",
    ".elementor-widget-text-editor",
    ".elementor-widget-button",
    ".elementor-widget-image",
    ".elementor-widget-icon-box",
    ".elementor-widget-icon-list",
    ".elementor-widget-trx_elm_counter",
    ".elementor-widget-n-accordion",
    ".elementor-widget-toggle",
    ".elementor-widget-form",
    ".hm-t-card",
    ".hm-work-group",
    ".hm-reviews-cta",
    ".hm-services-cta"
  ].join(",");

  var ZOOM_MATCH = ".elementor-widget-image, .hm-t-card";

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function revealAll() {
    var hidden = document.querySelectorAll(".hm-reveal");
    for (var i = 0; i < hidden.length; i++) hidden[i].classList.add("hm-in");
  }

  onReady(function () {
    try {
      if (!("IntersectionObserver" in window)) return; // old browser: stay visible

      var found = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));

      // Keep only visible, non-excluded elements.
      var kept = found.filter(function (el) {
        if (el.closest(EXCLUDE)) return false;
        if (!el.getClientRects().length) return false; // hidden at this breakpoint
        return true;
      });

      // Drop any element nested inside another kept element (reveal the outer one).
      var keptSet = new Set(kept);
      var targets = kept.filter(function (el) {
        var p = el.parentElement;
        while (p) {
          if (keptSet.has(p)) return false;
          p = p.parentElement;
        }
        return true;
      });

      if (!targets.length) return;

      // Stagger: delay by position among sibling targets (max ~360ms).
      var groups = new Map();
      targets.forEach(function (el) {
        var arr = groups.get(el.parentElement) || [];
        arr.push(el);
        groups.set(el.parentElement, arr);
      });
      groups.forEach(function (arr) {
        arr.forEach(function (el, i) {
          el.__hmDelay = Math.min(i * 90, 360);
        });
      });

      // Set the hidden start state (deferred script runs before first paint,
      // so there is no flash of un-hidden content).
      targets.forEach(function (el) {
        el.classList.add("hm-reveal");
        if (el.matches(ZOOM_MATCH)) el.classList.add("hm-zoom");
      });

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            el.style.transitionDelay = (el.__hmDelay || 0) + "ms";
            el.classList.add("hm-in");
            io.unobserve(el);
          });
        },
        { threshold: 0.01, rootMargin: "0px 0px -12% 0px" }
      );

      targets.forEach(function (el) {
        io.observe(el);
      });

      // Absolute failsafe: nothing stays hidden longer than 8s.
      setTimeout(revealAll, 8000);
    } catch (err) {
      revealAll();
    }
  });
})();
