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
      type: "Store · Shop",
      name: "H&M Locksmith & Security",
      addr: "609 Harrow Road, London W10 4RA",
      addrShort: "609 Harrow Road, W10 4RA",
      photo: "/assets/img/hero-hm-shop.jpg",
      lat: 51.527958, lng: -0.216658,
      gmap: "https://www.google.com/maps?cid=2993071067314997529"
    },
    {
      type: "Head Office",
      name: "The H&M Group — Office",
      addr: "124 Wilton Road, London SW1V 1AJ",
      addrShort: "124 Wilton Road, SW1V 1AJ",
      photo: "/assets/img/office-interior.jpg",
      lat: 51.493997, lng: -0.142223,
      gmap: "https://www.google.com/maps?cid=1214119125620460867"
    }
  ];

  var OFFICE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M3 21V7l7-4 7 4v3h4v11h-6v-5h-2v5H3zm4-6h2v-2H7v2zm0-4h2V9H7v2zm4 4h2v-2h-2v2zm0-4h2V9h-2v2z"/></svg>';

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
      ".hm-map-pop a:hover{text-decoration:underline}" +
      /* always-visible location cards on each pin */
      ".hm-loc-tip.leaflet-tooltip{background:transparent;border:0;box-shadow:none;padding:0;white-space:nowrap}" +
      ".hm-loc-tip.leaflet-tooltip::before{display:none}" +
      ".hm-loc-card{display:flex;align-items:center;gap:9px;width:204px;background:#fff;" +
        "border-radius:12px;overflow:hidden;box-shadow:0 8px 22px rgba(20,20,30,.25);" +
        "border:1px solid rgba(0,0,0,.06);text-decoration:none;font-family:'Hanken Grotesk',Arial,sans-serif}" +
      ".hm-loc-media{width:66px;height:66px;flex:none;background:#c41230;display:block}" +
      ".hm-loc-media img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".hm-loc-media--icon{display:grid;place-items:center}" +
      ".hm-loc-media--icon svg{width:30px;height:30px}" +
      ".hm-loc-body{padding:7px 12px 7px 0;min-width:0;white-space:normal}" +
      ".hm-loc-type{display:block;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#c41230;margin-bottom:1px}" +
      ".hm-loc-card strong{display:block;font-size:13px;color:#141414;line-height:1.18}" +
      ".hm-loc-addr{display:block;font-size:11px;color:#6a6a6a;line-height:1.3;margin-top:1px}" +
      /* tablet: a touch smaller, keep name + address */
      "@media (max-width:1024px){.hm-loc-card{width:196px}.hm-loc-media{width:58px;height:58px}}" +
      /* mobile: compact card — small photo + name + address */
      "@media (max-width:600px){.hm-loc-card{width:168px;gap:8px}.hm-loc-media{width:46px;height:46px}" +
        ".hm-loc-body{padding:6px 9px 6px 0}.hm-loc-card strong{font-size:11.5px;line-height:1.12}" +
        ".hm-loc-addr{font-size:9.5px;line-height:1.25}}";
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

      // always-visible labelled card so it's clear which pin is the Office vs Store
      var media = loc.photo
        ? '<span class="hm-loc-media"><img src="' + loc.photo + '" alt="" loading="lazy"></span>'
        : '<span class="hm-loc-media hm-loc-media--icon">' + OFFICE_ICON + "</span>";
      m.bindTooltip(
        '<a class="hm-loc-card" href="' + loc.gmap + '" target="_blank" rel="noopener">' +
          media +
          '<span class="hm-loc-body">' +
            "<strong>" + loc.name + "</strong>" +
            '<span class="hm-loc-addr">' + loc.addrShort + "</span>" +
          "</span>" +
        "</a>",
        { permanent: true, direction: "top", offset: [0, -30], className: "hm-loc-tip", interactive: true, opacity: 1 }
      );

      m.bindPopup(
        '<div class="hm-map-pop"><strong>' + loc.name + "</strong>" +
        "<span>" + loc.addr + "</span>" +
        '<a href="' + loc.gmap + '" target="_blank" rel="noopener">Open in Google Maps &rsaquo;</a></div>'
      );
      pts.push([loc.lat, loc.lng]);
    });

    // responsive padding so the always-visible cards have room and never clip
    var vw = window.innerWidth, pad;
    if (vw < 600)       pad = { tl: [88, 98],  br: [88, 56] };   // mobile (compact cards)
    else if (vw < 1025) pad = { tl: [104, 112], br: [104, 70] }; // tablet
    else                pad = { tl: [124, 128], br: [124, 76] }; // desktop
    map.fitBounds(pts, { paddingTopLeft: pad.tl, paddingBottomRight: pad.br, maxZoom: 13 });
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
