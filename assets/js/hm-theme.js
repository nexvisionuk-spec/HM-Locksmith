/* ==========================================================================
   H&M — dark / light theme toggle (homepage)
   The dark-premium styles live under html.hm-theme-dark (see hm-dark.css).
   An inline <head> script sets the initial theme before paint (default: dark).
   This adds the floating toggle button and persists the choice.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "hm-theme";
  var root = document.documentElement;

  var SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  var btn;
  function isDark() { return root.classList.contains("hm-theme-dark"); }
  function update() {
    if (!btn) return;
    var d = isDark();
    btn.innerHTML = d ? SUN : MOON;
    btn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode");
    btn.title = d ? "Light mode" : "Dark mode";
  }
  function setTheme(t) {
    root.classList.toggle("hm-theme-dark", t === "dark");
    try { localStorage.setItem(KEY, t); } catch (e) {}
    update();
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    btn = document.createElement("button");
    btn.className = "hm-theme-toggle";
    btn.type = "button";
    btn.addEventListener("click", function () {
      setTheme(isDark() ? "light" : "dark");
    });
    document.body.appendChild(btn);
    update();
  });
})();
