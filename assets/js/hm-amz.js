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

    /* ---- 2b. booking box: card heading + rename submit button ---- */
    try {
      var bookForm = document.querySelector(".elementor-element-17422a0 .elementor-form");
      if (bookForm && !bookForm.dataset.hmStyled) {
        bookForm.dataset.hmStyled = "1";
        var btn = bookForm.querySelector("button.elementor-button .elementor-button-text");
        if (btn) btn.textContent = "Request a booking";
        var wrapper = bookForm.querySelector(".elementor-form-fields-wrapper");
        if (wrapper && !wrapper.querySelector(".hm-book-head")) {
          var head = document.createElement("div");
          head.className = "hm-book-head";
          head.innerHTML =
            "<strong>Book a service</strong>" +
            "<span>Tell us what you need &mdash; we cover all of London</span>";
          wrapper.insertBefore(head, wrapper.firstChild);
        }
      }
    } catch (eBook) {}

    /* ---- 3. surface the reviews section higher (right after "We deliver") ---- */
    try {
      var reviews = document.querySelector(".elementor-element-13b28435");
      var anchor = document.querySelector(".elementor-element-11e96edd");
      if (reviews && anchor && anchor.parentNode && !reviews.dataset.hmMoved) {
        anchor.parentNode.insertBefore(reviews, anchor.nextSibling);
        reviews.dataset.hmMoved = "1";
      }
    } catch (e3) {}

    /* ---- 3b. move "Book A Service Now" up into the hero section ---- */
    try {
      var heroSec = document.querySelector(".elementor-element-78cf0e9");
      var bookSec = document.querySelector(".elementor-element-17422a0");
      if (heroSec && bookSec && !bookSec.dataset.hmInHero) {
        heroSec.appendChild(bookSec);
        bookSec.dataset.hmInHero = "1";
        heroSec.classList.add("hm-hero-has-book");
      }
    } catch (e3b) {}

    /* ---- 4. mobile burger menu: parent items that have a submenu (Trades,
       Services) only toggled the submenu and never navigated. Make a tap on
       the label text follow the link; the chevron icon still opens the submenu. */
    try {
      var mobMenu = document.querySelector(".trx-addons-mobile-menu");
      if (mobMenu && !mobMenu.dataset.hmNavFix) {
        mobMenu.dataset.hmNavFix = "1";
        mobMenu.addEventListener("click", function (ev) {
          /* let the chevron keep its expand/collapse behaviour */
          if (ev.target.closest(".trx-addons-dropdown-icon")) return;
          var link = ev.target.closest("a.trx-addons-menu-link-parent");
          if (!link) return;
          var li = link.closest("li");
          if (!li || !li.classList.contains("menu-item-has-children")) return;
          var href = link.getAttribute("href");
          if (!href || href === "#" || href.charAt(0) === "#") return;
          ev.stopImmediatePropagation();
          ev.preventDefault();
          window.location.href = href;
        }, true); /* capture phase: run before the theme's toggle handler */
      }
    } catch (e4) {}
  });
})();
