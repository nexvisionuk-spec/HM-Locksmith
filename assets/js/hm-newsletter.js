/* H&M Group — newsletter signup popup
   Self-contained: injects styles + modal, shows once per 7 days,
   submits to the Netlify "newsletter" form via AJAX (same pattern as chatbot.js). */
(function () {
  "use strict";

  var SHOW_AFTER_MS = 4000;      // delay before first appearance
  var SNOOZE_DAYS   = 7;         // don't re-show for this many days after close
  var KEY_SEEN = "hm_news_seen";
  var KEY_DONE = "hm_news_done";
  var LOGO = "/wp-content/uploads/2025/09/HM_Main_logo.png";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function shouldShow() {
    if (read(KEY_DONE)) return false;                 // already signed up
    var seen = parseInt(read(KEY_SEEN) || "0", 10);
    if (seen && (Date.now() - seen) < SNOOZE_DAYS * 864e5) return false;
    return true;
  }

  var CSS = ''
    + '.hm-news-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;'
    + 'padding:20px;background:rgba(14,15,18,.55);opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}'
    + '.hm-news-overlay.is-open{opacity:1;visibility:visible}'
    + '.hm-news-card{position:relative;width:100%;max-width:940px;background:#fff;border-radius:16px;'
    + 'box-shadow:0 30px 80px rgba(10,16,38,.35);display:grid;grid-template-columns:1.05fr 1fr;gap:34px;'
    + 'padding:46px 44px;transform:translateY(14px) scale(.98);transition:transform .25s ease}'
    + '.hm-news-overlay.is-open .hm-news-card{transform:none}'
    + '.hm-news-close{position:absolute;top:-16px;right:-16px;width:46px;height:46px;border:none;cursor:pointer;'
    + 'border-radius:50%;background:#C41230;color:#fff;font-size:24px;line-height:46px;text-align:center;'
    + 'box-shadow:0 6px 18px rgba(196,18,48,.45);transition:background .15s ease,transform .15s ease}'
    + '.hm-news-close:hover{background:#A00F24;transform:scale(1.06)}'
    + '.hm-news-title{margin:0;color:#C41230;font-weight:800;font-size:clamp(28px,3.4vw,42px);line-height:1.08;letter-spacing:-.5px}'
    + '.hm-news-divider{display:block;width:86%;height:2px;background:#e7e2e4;margin:26px 0 22px}'
    + '.hm-news-logo{width:170px;max-width:60%;height:auto;display:block}'
    + '.hm-news-right{display:flex;flex-direction:column;justify-content:center}'
    + '.hm-news-field{margin:0 0 26px}'
    + '.hm-news-field label{display:block;font-weight:700;color:#0e0f12;font-size:16px;margin:0 0 8px}'
    + '.hm-news-field input{width:100%;border:none;border-bottom:2px solid #d9d4d6;background:transparent;'
    + 'padding:8px 2px;font-size:16px;color:#0e0f12;outline:none;transition:border-color .15s ease}'
    + '.hm-news-field input:focus{border-bottom-color:#C41230}'
    + '.hm-news-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}'
    + '.hm-news-btn{width:100%;border:none;cursor:pointer;background:#C41230;color:#fff;font-weight:700;font-size:17px;'
    + 'padding:16px 20px;border-radius:6px;margin-top:6px;transition:background .15s ease}'
    + '.hm-news-btn:hover{background:#A00F24}.hm-news-btn:disabled{opacity:.7;cursor:default}'
    + '.hm-news-done{text-align:center}'
    + '.hm-news-done h3{color:#C41230;font-size:26px;margin:0 0 10px}'
    + '.hm-news-done p{color:#444;font-size:16px;margin:0}'
    + '@media(max-width:760px){'
    + '.hm-news-card{grid-template-columns:1fr;gap:20px;padding:34px 22px;max-width:460px}'
    + '.hm-news-close{top:-14px;right:-6px}'
    + '.hm-news-divider{margin:18px 0 16px;width:100%}'
    + '.hm-news-logo{width:140px;margin:0 auto}'
    + '.hm-news-left{text-align:center}'
    + '}';

  var HTML = ''
    + '<div class="hm-news-card" role="dialog" aria-modal="true" aria-label="Newsletter signup">'
    + '<button type="button" class="hm-news-close" aria-label="Close">&times;</button>'
    + '<div class="hm-news-left">'
    + '<h2 class="hm-news-title">Get the Latest News, Discounts and Events to Your Inbox</h2>'
    + '<span class="hm-news-divider"></span>'
    + '<img class="hm-news-logo" src="' + LOGO + '" alt="The H&amp;M Group" width="170" height="170" loading="lazy">'
    + '</div>'
    + '<div class="hm-news-right">'
    + '<form class="hm-news-form" name="newsletter" method="post" data-netlify="true" netlify-honeypot="bot-field">'
    + '<input type="hidden" name="form-name" value="newsletter">'
    + '<p class="hm-news-field"><label for="hm-news-email">Email</label>'
    + '<input id="hm-news-email" type="email" name="email" required autocomplete="email"></p>'
    + '<p class="hm-news-field"><label for="hm-news-name">First Name</label>'
    + '<input id="hm-news-name" type="text" name="first_name" autocomplete="given-name"></p>'
    + '<input class="hm-news-hp" type="text" name="bot-field" tabindex="-1" autocomplete="off" aria-hidden="true">'
    + '<button type="submit" class="hm-news-btn">Sign Up</button>'
    + '</form>'
    + '<div class="hm-news-done" hidden><h3>You&rsquo;re in! 🎉</h3><p>Thanks for subscribing. Keep an eye on your inbox for news, offers and events.</p></div>'
    + '</div>'
    + '</div>';

  function init() {
    if (!shouldShow()) return;

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var overlay = document.createElement("div");
    overlay.className = "hm-news-overlay";
    overlay.innerHTML = HTML;
    document.body.appendChild(overlay);

    var form  = overlay.querySelector(".hm-news-form");
    var done  = overlay.querySelector(".hm-news-done");
    var btn   = overlay.querySelector(".hm-news-btn");

    function open() { overlay.classList.add("is-open"); }
    function close() {
      overlay.classList.remove("is-open");
      store(KEY_SEEN, String(Date.now()));
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }

    overlay.querySelector(".hm-news-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="bot-field"]').value) { close(); return; } // bot
      btn.disabled = true; btn.textContent = "Signing up…";
      var body = new URLSearchParams();
      body.append("form-name", "newsletter");
      body.append("email", (overlay.querySelector("#hm-news-email").value || "").trim());
      body.append("first_name", (overlay.querySelector("#hm-news-name").value || "").trim());
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function () { finish(); })
        .catch(function () { finish(); }); // still thank the user; submission is best-effort
    });

    function finish() {
      store(KEY_DONE, "1");
      form.hidden = true;
      done.hidden = false;
      setTimeout(close, 2600);
    }

    setTimeout(open, SHOW_AFTER_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
