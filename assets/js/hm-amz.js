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

    /* ---- 2c. stat counter icons (home / calendar / users / star) ---- */
    try {
      var STAT_ICONS = {
        "b18b307": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
        "1a88f71": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v3M16 3v3"/></svg>',
        "162ea48": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M21 20c0-2.4-1.3-4.3-3.3-5.1"/></svg>',
        "1b57108": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.9 5.9 6.1.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.8l6.1-.9z"/></svg>'
      };
      Object.keys(STAT_ICONS).forEach(function (id) {
        var wrap = document.querySelector(".trx-addons-counter-" + id + " .trx-addons-counter-number-title-wrap");
        if (wrap && !wrap.querySelector(".hm-stat-ic")) {
          var ic = document.createElement("span");
          ic.className = "hm-stat-ic";
          ic.innerHTML = STAT_ICONS[id];
          wrap.insertBefore(ic, wrap.firstChild);
        }
      });
    } catch (eStat) {}

    /* ---- 2d. "Trusted by" label above the client-logos carousel ---- */
    try {
      var logoSec = document.querySelector(".elementor-element-5211d46");
      if (logoSec && !logoSec.querySelector(".hm-trusted-by")) {
        var tb = document.createElement("div");
        tb.className = "hm-trusted-by";
        tb.textContent = "Trusted by leading brands";
        logoSec.insertBefore(tb, logoSec.firstChild);
      }
    } catch (eTrust) {}

    /* ---- 2e. service feature cards: eyebrow + divider, arrow in "More Details" ---- */
    try {
      var CARD_EYEBROW = { "1b82d32": "Residential", "95fdff0": "Commercial" };
      Object.keys(CARD_EYEBROW).forEach(function (tid) {
        var title = document.querySelector(".elementor-element-" + tid);
        if (title && !(title.previousElementSibling && title.previousElementSibling.className === "hm-card-eyebrow")) {
          var eb = document.createElement("div");
          eb.className = "hm-card-eyebrow";
          eb.innerHTML = "<span>" + CARD_EYEBROW[tid] + "</span><i></i>";
          title.parentNode.insertBefore(eb, title);
        }
      });
      var ARROW = '<svg class="hm-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      var ARROW_PLAIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      ["d32e9ce", "36c3658"].forEach(function (mid) {
        var a = document.querySelector(".elementor-element-" + mid + " a");
        if (!a) return;
        if (!a.querySelector("svg")) a.insertAdjacentHTML("beforeend", ARROW);
        var h6 = a.closest("h6");
        if (h6 && !h6.querySelector(".hm-card-arrow-btn")) {
          var href = a.getAttribute("href") || "/trades/";
          h6.insertAdjacentHTML("beforeend", '<a class="hm-card-arrow-btn" href="' + href + '" aria-label="More details">' + ARROW_PLAIN + "</a>");
        }
      });
    } catch (eCard) {}

    /* ---- 2f. "More Details" + circular arrow buttons on the Core Services cards ---- */
    try {
      var MD_ARR = '<svg class="hm-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      var CIRC_ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      var coreCards = document.querySelectorAll("#services .e-con-inner > .e-child");
      Array.prototype.forEach.call(coreCards, function (card) {
        if (!card.querySelector(".trx-addons-info-box")) return;      /* skip the heading block */
        /* category eyebrow + divider above the title (mockup design) */
        var content = card.querySelector(".trx-addons-info-box-content");
        if (content && !content.querySelector(".hm-card-eyebrow")) {
          var titleEl = card.querySelector(".trx-addons-info-box-title");
          var tt = (titleEl && titleEl.textContent) || "";
          var CATS = [["Building","Construction"],["Insurance","Insurance"],["Reactive","Maintenance"],
                      ["Residential","Residential"],["Retail","Commercial"],["Technical","Technical"],["Property","Property"]];
          var cat = "Services";
          for (var ci = 0; ci < CATS.length; ci++) { if (tt.indexOf(CATS[ci][0]) >= 0) { cat = CATS[ci][1]; break; } }
          var eb = document.createElement("div");
          eb.className = "hm-card-eyebrow";
          eb.innerHTML = "<span>" + cat + "</span><i></i>";
          content.insertBefore(eb, content.firstChild);
        }
        if (card.querySelector(".hm-card-cta")) return;               /* idempotent */
        var link = card.querySelector(".trx-addons-info-box-container-link");
        var href = (link && link.getAttribute("href")) || "/trades/";
        var cta = document.createElement("div");
        cta.className = "hm-card-cta";
        cta.innerHTML =
          '<a class="hm-card-md-btn" href="' + href + '">More Details ' + MD_ARR + '</a>' +
          '<a class="hm-card-arrow-btn hm-card-arrow-btn--light" href="' + href + '" aria-label="More details">' + CIRC_ARR + '</a>';
        card.appendChild(cta);
      });
    } catch (e2f) {}

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

    /* ---- 3c. move the "Trusted by" logos strip up to right after the hero ---- */
    try {
      var trustedSec = document.querySelector(".elementor-element-5211d46");
      var heroForTrust = document.querySelector(".elementor-element-78cf0e9");
      if (trustedSec && heroForTrust && heroForTrust.parentNode && !trustedSec.dataset.hmMovedTop) {
        heroForTrust.parentNode.insertBefore(trustedSec, heroForTrust.nextSibling);
        trustedSec.dataset.hmMovedTop = "1";
      }
    } catch (e3c) {}

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
