/* H&M Locksmith & Building Services — site interactions */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav__toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".nav__menu a").forEach(function (a) {
      a.addEventListener("click", function () { header.classList.remove("is-open"); });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var ans = item.querySelector(".faq__a");
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      ans.style.maxHeight = open ? ans.scrollHeight + "px" : null;
    });
  });

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Animated stat counters */
  var stats = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && stats.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dec = (target % 1 !== 0) ? 1 : 0;
        var start = null, dur = 1400;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = (target * (0.5 - Math.cos(p * Math.PI) / 2));
          el.textContent = val.toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(dec) + suffix;
        }
        requestAnimationFrame(tick);
        so.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { so.observe(el); });
  }

  /* Contact / quote form — front-end handling (Netlify forms friendly) */
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      // Allow native Netlify submission; show inline success without leaving page
      var success = form.querySelector(".form-success");
      if (!success) return;
      ev.preventDefault();
      var data = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      }).then(function () {
        form.reset();
        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }).catch(function () {
        // Fallback: submit normally
        form.removeAttribute("data-ajax");
        form.submit();
      });
    });
  });

  /* Before / after slider */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba-range");
    if (!range) return;
    function set(v) { ba.style.setProperty("--pos", v + "%"); }
    set(range.value || 50);
    range.addEventListener("input", function () { set(range.value); });
  });

  /* Year in footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
