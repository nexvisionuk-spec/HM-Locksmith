/* ==========================================================================
   H&M interactive locations map
   Replaces the static map picture with a real zoomable / pannable Leaflet map
   (OpenStreetMap tiles, no API key) showing both shops with markers + popups.
   Leaflet is loaded lazily the first time a map scrolls near the viewport.
   ========================================================================== */
(function () {
  "use strict";

  var LOCATIONS = [
    {
      name: "Store",
      addr: "609 Harrow Road, London W10 4RA",
      lat: 51.527958, lng: -0.216658,
      gmap: "https://www.google.com/maps?cid=2993071067314997529"
    },
    {
      name: "Head Office",
      addr: "124 Wilton Road, London SW1V 1AJ",
      lat: 51.493997, lng: -0.142223,
      gmap: "https://www.google.com/maps?cid=1214119125620460867"
    }
  ];

  var LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
  var LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

  // one-off CSS for the live map container
  (function injectStyle() {
    if (document.getElementById("hm-map-style")) return;
    var s = document.createElement("style");
    s.id = "hm-map-style";
    s.textContent =
      ".hm-map-wrap .hm-map-img,.hm-map-wrap .hm-pin{display:none!important}" +
      ".hm-map-live{width:100%;height:clamp(320px,52vw,460px);border-radius:16px;" +
        "overflow:hidden;box-shadow:0 14px 34px rgba(20,20,30,.14);z-index:1}" +
      ".hm-map-live .leaflet-container{height:100%;width:100%;font:inherit;background:#e8eaed}" +
      ".hm-map-pin{display:grid;place-items:center}" +
      ".hm-map-pin svg{width:34px;height:34px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}" +
      ".hm-map-pop{font-family:'Hanken Grotesk',Arial,sans-serif;min-width:170px}" +
      ".hm-map-pop strong{display:block;font-size:14px;color:#141414;margin-bottom:2px}" +
      ".hm-map-pop span{display:block;font-size:12.5px;color:#555;line-height:1.5;margin-bottom:7px}" +
      ".hm-map-pop a{font-size:12.5px;font-weight:700;color:#c41230;text-decoration:none}" +
      ".hm-map-pop a:hover{text-decoration:underline}";
    document.head.appendChild(s);
  })();

  var leafletLoading = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletLoading) return leafletLoading;
    leafletLoading = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href="' + LEAFLET_CSS + '"]')) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = LEAFLET_CSS;
        document.head.appendChild(link);
      }
      var sc = document.createElement("script");
      sc.src = LEAFLET_JS;
      sc.async = true;
      sc.onload = resolve;
      sc.onerror = reject;
      document.head.appendChild(sc);
    });
    return leafletLoading;
  }

  function redPin() {
    return window.L.divIcon({
      className: "hm-map-pin",
      html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path fill="#c41230" stroke="#fff" stroke-width="1.5" ' +
            'd="M12 2C8.1 2 5 5.1 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.9-3.1-7-7-7z"/>' +
            '<circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>',
      iconSize: [34, 34],
      iconAnchor: [17, 32],
      popupAnchor: [0, -30]
    });
  }

  function buildMap(wrap) {
    var L = window.L;
    var el = document.createElement("div");
    el.className = "hm-map-live";
    wrap.appendChild(el);

    var map = L.map(el, { scrollWheelZoom: true, zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var icon = redPin();
    var pts = [];
    LOCATIONS.forEach(function (loc) {
      var m = L.marker([loc.lat, loc.lng], { icon: icon, title: loc.name }).addTo(map);
      m.bindPopup(
        '<div class="hm-map-pop"><strong>' + loc.name + "</strong>" +
        "<span>" + loc.addr + "</span>" +
        '<a href="' + loc.gmap + '" target="_blank" rel="noopener">Open in Google Maps &rsaquo;</a></div>'
      );
      pts.push([loc.lat, loc.lng]);
    });

    map.fitBounds(pts, { padding: [48, 48], maxZoom: 14 });
    // keep tiles sharp after the container animates/reveals
    setTimeout(function () { map.invalidateSize(); }, 300);
  }

  function initWrap(wrap) {
    if (wrap.dataset.hmMap) return;
    wrap.dataset.hmMap = "1";
    loadLeaflet().then(function () { buildMap(wrap); }).catch(function () {
      // Leaflet failed to load — leave the static image in place
      delete wrap.dataset.hmMap;
      var img = wrap.querySelector(".hm-map-img"), pins = wrap.querySelectorAll(".hm-pin");
      if (img) img.style.display = "";
      pins.forEach(function (p) { p.style.display = ""; });
    });
  }

  function start() {
    var wraps = [].slice.call(document.querySelectorAll(".hm-map-wrap"));
    if (!wraps.length) return;
    if (!("IntersectionObserver" in window)) { wraps.forEach(initWrap); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { initWrap(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: "400px 0px" });
    wraps.forEach(function (w) { io.observe(w); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
