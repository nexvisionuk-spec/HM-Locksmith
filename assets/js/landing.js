/* H&M Group - landing page helpers: forms -> WhatsApp, sticky spacing */
(function(){
  var WA = "447956128990";   // owner WhatsApp
  document.addEventListener("submit", function(e){
    var f = e.target.closest && e.target.closest(".hm-form");
    if (!f) return;
    e.preventDefault();
    var lines = [];
    ["hm-field-type","hm-field-service","hm-field-name","hm-field-phone",
     "hm-field-postcode","hm-field-msg"].forEach(function(n){
      var el = f.querySelector("[data-hm='"+n+"']");
      if (el && el.value) lines.push((el.getAttribute("data-hm-label")||n.replace("hm-field-","")) + ": " + el.value);
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