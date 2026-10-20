/* ==========================================================================
   H&M — AMZ-inspired structure (homepage)
   Injects the layout signatures adapted from amzlocksmith.co.uk, in H&M's
   own words. Idempotent.
   ========================================================================== */
(function () {
  "use strict";

  var STAR = '<svg class="hm-usp-star" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11h-5v-2h3V7h2z"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    try {
      if (document.querySelector(".hm-usp-bar")) return;
      var bar = document.createElement("div");
      bar.className = "hm-usp-bar";
      bar.innerHTML =
        '<span class="hm-usp">' + STAR + "5.0 Rated on Google</span>" +
        '<span class="hm-usp">' + CLOCK + "24/7 Emergency Call-Outs</span>" +
        '<span class="hm-usp hm-usp-sm-hide">' + PIN + "Covering All of London</span>" +
        '<span class="hm-usp">' + CHECK + "No Hidden Fees</span>";
      // place it at the very top of the page, above the header
      var host = document.querySelector(".page_wrap") || document.body;
      host.insertBefore(bar, host.firstChild);
    } catch (e) {}

    /* ---- hero "Happy clients" badge (faces removed) ---- */
    try {
      var faceImg = document.querySelector('.elementor-element-78cf0e9 img[src*="custom-img-503-fourth"]');
      if (faceImg && !document.querySelector(".hm-happy")) {
        var badge = document.createElement("div");
        badge.className = "hm-happy";
        badge.innerHTML =
          '<span class="hm-happy-badge">+1K</span>' +
          '<span class="hm-happy-meta">' +
            '<span class="hm-happy-stars">★★★★★</span>' +
            '<span class="hm-happy-label">Happy clients</span>' +
          "</span>";
        faceImg.insertAdjacentElement("beforebegin", badge);
      }
    } catch (eHappy) {}

    /* ---- 2. hero call-now + reviews cards ---- */
    try {
      var heroCol = document.querySelector(".elementor-element-3eb0787");
      if (heroCol && !heroCol.querySelector(".hm-hero-cards")) {
        var PHONE =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z"/></svg>';
        var cards = document.createElement("div");
        cards.className = "hm-hero-cards";
        cards.innerHTML =
          '<a class="hm-hc hm-hc-call" href="tel:02031051145" aria-label="Call 0203 105 1145">' +
            '<span class="hm-hc-ic">' + PHONE + "</span>" +
            '<span class="hm-hc-body"><small>24/7 Emergency — call now</small><strong>0203 105 1145</strong></span>' +
          "</a>" +
          '<div class="hm-hc hm-hc-rev">' +
            '<span class="hm-hc-stars">★★★★★</span>' +
            '<span class="hm-hc-body"><strong>Rated 5.0 on Google</strong><small>Trusted across London</small></span>' +
          "</div>";
        heroCol.appendChild(cards);
      }
    } catch (e2) {}

    /* ---- 3. surface the reviews section higher (right after "We deliver") ---- */
    try {
      var reviews = document.querySelector(".elementor-element-13b28435");
      var anchor = document.querySelector(".elementor-element-11e96edd");
      if (reviews && anchor && anchor.parentNode && !reviews.dataset.hmMoved) {
        anchor.parentNode.insertBefore(reviews, anchor.nextSibling);
        reviews.dataset.hmMoved = "1";
      }
    } catch (e3) {}
  });
})();
