/* H&M Group - landing page helpers: forms -> WhatsApp, sticky spacing */
(function(){
  var WA = "447956128990";   // owner WhatsApp
  document.addEventListener("submit", function(e){
    var f = e.target.closest && e.target.closest(".hm-form");
    if (!f) return;
    e.preventDefault();
    var lines = [];
    // collect every field carrying a data-hm attribute, in DOM order
    Array.prototype.forEach.call(f.querySelectorAll("[data-hm]"), function(el){
      if (el.type === "file") {
        if (el.files && el.files.length) lines.push((el.getAttribute("data-hm-label")||"Photos") + ": " + el.files.length + " photo(s) to follow");
        return;
      }
      if (el.value) lines.push((el.getAttribute("data-hm-label")||el.getAttribute("data-hm").replace("hm-field-","")) + ": " + el.value);
    });
    var type = f.getAttribute("data-hm-type") || "enquiry";
    var text = "Hello H&M (" + type + ") - " + (lines.join(" | ") || "I'd like a free quotation");
    var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
    // show a small confirmation and open WhatsApp
    var btn = f.querySelector("button[type=submit]");
    if (btn && btn.dataset.orig) btn.innerHTML = btn.dataset.orig;
    if (btn) btn.dataset.orig = btn.innerHTML;
    if (btn) btn.innerHTML = "Opening WhatsApp…";
    setTimeout(function(){ window.open(url, "_blank"); }, 350);
  });

  // ensure body offsets for the fixed sticky bar
  if (document.querySelector(".hm-sticky-bar")) document.body.classList.add("hm-has-sticky");
})();