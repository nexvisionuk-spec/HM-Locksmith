/* H&M Group — newsletter signup popup
   Self-contained: injects styles + modal, shows once per 7 days,
   submits to the Netlify "newsletter" form via AJAX (same pattern as chatbot.js). */
(function () {
  "use strict";

  var SHOW_AFTER_MS = 7000;      // delay before first appearance
  var SNOOZE_DAYS   = 7;         // don't re-show for this many days after close
  var KEY_SEEN = "hm_news_seen";
  var KEY_DONE = "hm_news_done";
  var LOGO = "/wp-content/uploads/2025/09/HM_Main_logo.png";
  var BG   = "/wp-content/uploads/2026/09/magnific_upscale_WDCjAbecXe-scaled.webp";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function shouldShow() {
    // Appears on every page load — no per-visitor snooze, no signup memory.
    return true;
  }

  var CSS = ''
    + '.hm-news-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;'
    + 'padding:20px;background:rgba(10,8,9,.65);opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}'
    + '.hm-news-overlay.is-open{opacity:1;visibility:visible}'
    + '.hm-news-card{position:relative;width:100%;max-width:940px;border-radius:18px;overflow:hidden;isolation:isolate;'
    + 'background:#1a1012 url(' + '"' + BG + '"' + ') center/cover no-repeat;'
    + 'box-shadow:0 30px 80px rgba(10,16,38,.45);display:grid;grid-template-columns:1.05fr 1fr;'
    + 'transform:translateY(14px) scale(.98);transition:transform .25s ease}'
    + '.hm-news-card::before{content:"";position:absolute;inset:0;z-index:0;'
    + 'background:linear-gradient(100deg,rgba(10,8,9,.92) 0%,rgba(14,9,10,.86) 42%,rgba(196,18,48,.28) 100%)}'
    + '.hm-news-overlay.is-open .hm-news-card{transform:none}'
    + '.hm-news-close{all:unset;box-sizing:border-box;position:absolute;top:16px;right:16px;z-index:3;'
    + 'width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;'
    + 'border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:20px;line-height:1;'
    + 'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);'
    + 'border:1px solid rgba(255,255,255,.3);transition:background .15s ease,transform .15s ease}'
    + '.hm-news-close:hover{background:#C41230;border-color:#C41230;transform:scale(1.08)}'
    + '.hm-news-left{position:relative;z-index:1;padding:50px 30px 50px 46px;display:flex;flex-direction:column;justify-content:center}'
    + '.hm-news-title{margin:0;color:#fff;font-weight:800;font-size:clamp(26px,3.1vw,38px);line-height:1.12;letter-spacing:-.5px;'
    + 'text-shadow:0 2px 14px rgba(0,0,0,.35)}'
    + '.hm-news-sub{margin:14px 0 0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.55;max-width:320px}'
    + '.hm-news-divider{display:block;width:70px;height:3px;background:#C41230;border-radius:3px;margin:26px 0}'
    + '.hm-news-logo{width:92px;height:92px;border-radius:50%;box-shadow:0 8px 26px rgba(0,0,0,.4);display:block}'
    + '.hm-news-right{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;'
    + 'margin:18px 18px 18px 0;padding:34px 32px;background:rgba(255,255,255,.96);border-radius:14px;'
    + 'box-shadow:0 18px 40px rgba(0,0,0,.25)}'
    + '.hm-news-field{margin:0 0 22px}'
    + '.hm-news-field label{display:block;font-weight:700;color:#0e0f12;font-size:14px;margin:0 0 8px}'
    + '.hm-news-field input{width:100%;box-sizing:border-box;border:none;border-bottom:2px solid #d9d4d6;background:transparent;'
    + 'padding:8px 2px;font-size:16px;color:#0e0f12;outline:none;transition:border-color .15s ease}'
    + '.hm-news-field input:focus{border-bottom-color:#C41230}'
    + '.hm-news-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}'
    + '.hm-news-btn{all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;cursor:pointer;'
    + 'background:#C41230;color:#fff;font-weight:700;font-size:16px;padding:15px 20px;border-radius:7px;'
    + 'margin-top:4px;transition:background .15s ease}'
    + '.hm-news-btn:hover{background:#A00F24}.hm-news-btn:disabled{opacity:.7;cursor:default}'
    + '.hm-news-done{text-align:center}'
    + '.hm-news-done h3{color:#C41230;font-size:24px;margin:0 0 10px}'
    + '.hm-news-done p{color:#444;font-size:15px;margin:0}'
    + '@media(max-width:760px){'
    + '.hm-news-card{grid-template-columns:1fr;max-width:420px;max-height:92vh;overflow-y:auto}'
    + '.hm-news-left{padding:40px 24px 20px;text-align:center;align-items:center}'
    + '.hm-news-sub{max-width:none}'
    + '.hm-news-divider{margin:20px auto}'
    + '.hm-news-logo{margin:0 auto}'
    + '.hm-news-right{margin:0 18px 22px;padding:28px 22px}'
    + '}';

  var HTML = ''
    + '<div class="hm-news-card" role="dialog" aria-modal="true" aria-label="Newsletter signup">'
    + '<button type="button" class="hm-news-close" aria-label="Close">&times;</button>'
    + '<div class="hm-news-left">'
    + '<img class="hm-news-logo" src="' + LOGO + '" alt="The H&amp;M Group" width="92" height="92" loading="lazy">'
    + '<span class="hm-news-divider"></span>'
    + '<h2 class="hm-news-title">Get the Latest News, Discounts and Events to Your Inbox</h2>'
    + '<p class="hm-news-sub">Join our mailing list for seasonal offers, maintenance tips and first access to new H&amp;M services.</p>'
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
