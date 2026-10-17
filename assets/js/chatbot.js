/* ==========================================================================
   H&M AI Assistant — free lead-capture chatbot
   - Real AI answers via Gemini (through a secure Netlify Function proxy)
   - Falls back to a guided Q&A if AI isn't configured / is unavailable
   - Always captures the lead and hands off to WhatsApp + email backup
   ========================================================================== */
(function () {
  "use strict";

  /* ======================= CONFIG — edit these ======================= *
   * whatsapp: owner's WhatsApp number, INTERNATIONAL format, digits only.
   *           e.g. UK mobile 07956 128990  ->  447956128990
   * aiEndpoint: the Netlify Function URL. Leave as-is once deployed on
   *             Netlify. Set to "" to force guided-only mode (no AI).
   * ------------------------------------------------------------------- */
  var CONFIG = {
    whatsapp: "447956128990",                 // <-- CONFIRM / CHANGE owner WhatsApp number
    aiEndpoint: "/.netlify/functions/chat",   // secure Gemini proxy (free)
    businessName: "H&M Locksmith & Building Services",
    emergencyPhone: "+442031051145",
    emergencyPhoneLabel: "0203 105 1145",
    buildingPhone: "+442033024022",
    formName: "chatbot-lead"
  };

  var SERVICES = [
    "🔒 Emergency lockout", "🔑 Locksmith & security", "🚗 Car keys / auto locksmith",
    "🏗️ Building & refurbishment", "⚡ Electrical", "🔥 Plumbing & heating",
    "🎨 Painting & decorating", "💬 Something else"
  ];

  /* Guided question flow (also the fallback when AI is off/unavailable) */
  var STEPS = [
    { key: "service", prompt: "Hi! 👋 I'm Harry, the H&M virtual assistant — we're here 24/7. What do you need help with today?", reask: "So, what can our team help you with today?" },
    { key: "name",    prompt: "Great, I can help with that. 😊 First, what's your name?", reask: "What's your name?" },
    { key: "phone",   prompt: "Thanks{name}! What's the best phone number for our team to reach you on?", reask: "What's the best phone number to reach you on?", validate: "phone" },
    { key: "area",    prompt: "And what's your postcode or area in London?", reask: "And your postcode or area in London?" },
    { key: "urgency", prompt: "How urgent is it?", reask: "How urgent is it?", chips: ["🚨 Emergency — right now", "📅 Today / this week", "💬 Just after a quote"] },
    { key: "details", prompt: "Anything else you'd like the team to know? (Or tap Skip.)", reask: "Anything else the team should know? (Or tap Skip.)", chips: ["Skip"], optional: true }
  ];

  var state = {
    open: false, built: false, stepIndex: 0, data: {}, transcript: [],
    aiAvailable: null,          // null=unknown, true/false after first try
    mode: "guided",             // "ai" once a reply is confirmed
    finished: false, busy: false
  };

  var el = {};

  /* ---------------------------------------------------------------- UI */
  function build() {
    if (state.built) return;
    var launch = document.createElement("button");
    launch.className = "hmchat-launch";
    launch.setAttribute("aria-label", "Open chat assistant");
    launch.innerHTML =
      '<span class="ic"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.4A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg></span><span class="label-sm">Chat with us</span>';
    launch.addEventListener("click", openPanel);

    // Proactive greeting teaser (shows shortly after arrival, once per session)
    var teaser = document.createElement("div");
    teaser.className = "hmchat-teaser";
    teaser.setAttribute("role", "button");
    teaser.setAttribute("tabindex", "0");
    teaser.innerHTML =
      '<button class="hmchat-teaser-x" aria-label="Dismiss">&times;</button>' +
      '<p><strong>👋 Hi, I\'m Harry!</strong><br>Locked out or after a quote? I\'m here 24/7 — tap to chat.</p>';
    teaser.hidden = true;
    teaser.addEventListener("click", function (e) {
      if (e.target.classList.contains("hmchat-teaser-x")) { e.stopPropagation(); dismissTeaser(); return; }
      openPanel();
    });

    var panel = document.createElement("div");
    panel.className = "hmchat panel hmchat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "H&M chat assistant");
    panel.innerHTML =
      '<div class="hmchat-head">' +
        '<img class="av" src="/assets/images/logo-badge.svg" alt="H&amp;M Group logo" width="46" height="46">' +
        '<div><h4>Harry</h4><p><span class="online"></span> H&amp;M Assistant · online 24/7</p></div>' +
        '<button class="close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="hmchat-body" id="hmchatBody" aria-live="polite"></div>' +
      '<div class="hmchat-chips" id="hmchatChips"></div>' +
      '<form class="hmchat-input" id="hmchatForm">' +
        '<input id="hmchatText" type="text" autocomplete="off" placeholder="Type your message…" aria-label="Type your message">' +
        '<button type="submit" aria-label="Send">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>' +
        '</button>' +
      '</form>' +
      '<div class="hmchat-foot">Secured &amp; powered by H&amp;M · available 24/7</div>';

    document.body.appendChild(launch);
    document.body.appendChild(panel);
    document.body.appendChild(teaser);

    el.launch = launch;
    el.teaser = teaser;
    el.panel = panel;
    el.body = panel.querySelector("#hmchatBody");
    el.chips = panel.querySelector("#hmchatChips");
    el.form = panel.querySelector("#hmchatForm");
    el.text = panel.querySelector("#hmchatText");
    panel.querySelector(".close").addEventListener("click", closePanel);
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = el.text.value.trim();
      if (!v || state.busy) return;
      el.text.value = "";
      handleUser(v);
    });
    state.built = true;
    maybeShowTeaser();
  }

  function openPanel() {
    build();
    dismissTeaser();
    state.open = true;
    el.panel.classList.add("is-open");
    el.launch.hidden = true;
    if (!state.transcript.length) startConversation();
    setTimeout(function () { el.text.focus(); }, 200);
  }
  function closePanel() {
    state.open = false;
    el.panel.classList.remove("is-open");
    el.launch.hidden = false;
  }

  function dismissTeaser() {
    if (el.teaser) { el.teaser.classList.remove("in"); el.teaser.hidden = true; }
    try { sessionStorage.setItem("hmchat_teaser", "1"); } catch (e) {}
  }
  function maybeShowTeaser() {
    // Proactive greeting bubble disabled — the user wants only the chat launcher
    // button visible (no extra bubble/shadow above it).
    return;
  }

  /* ------------------------------------------------------------- render */
  function addMsg(text, who) {
    var m = document.createElement("div");
    m.className = "hmchat-msg " + who;
    m.textContent = text;
    el.body.appendChild(m);
    scroll();
  }
  function scroll() { el.body.scrollTop = el.body.scrollHeight; }

  function typing(on) {
    var t = el.body.querySelector(".hmchat-typing");
    if (on) {
      if (t) return;
      var d = document.createElement("div");
      d.className = "hmchat-typing";
      d.innerHTML = "<span></span><span></span><span></span>";
      el.body.appendChild(d); scroll();
    } else if (t) { t.remove(); }
  }

  function setChips(list) {
    el.chips.innerHTML = "";
    (list || []).forEach(function (c) {
      var b = document.createElement("button");
      b.className = "hmchat-chip" + (c.cls ? " " + c.cls : "");
      b.innerHTML = c.label;
      b.addEventListener("click", c.onClick);
      el.chips.appendChild(b);
    });
  }
  function clearChips() { el.chips.innerHTML = ""; }

  function botSay(text, cb, delay) {
    typing(true);
    setTimeout(function () {
      typing(false);
      addMsg(text, "bot");
      state.transcript.push({ role: "model", text: text });
      if (cb) cb();
    }, delay || 650);
  }

  /* ---------------------------------------------------------- flow */
  function startConversation() {
    state.stepIndex = 0; state.data = {}; state.finished = false;
    askStep();
  }

  function askStep() {
    var step = STEPS[state.stepIndex];
    if (!step) return finish();
    var prompt = step.prompt.replace("{name}", state.data.name ? " " + state.data.name : "");
    botSay(prompt, function () {
      if (step.chips) {
        setChips(step.chips.map(function (label) {
          return { label: label, onClick: function () { handleUser(label); } };
        }));
      } else { clearChips(); }
    });
  }

  function looksLikeQuestion(t) {
    return /\?\s*$/.test(t) ||
      /^(what|how|do|does|did|can|could|is|are|will|would|when|where|why|who|price|cost|how much|tell me|explain)\b/i.test(t.trim());
  }

  function handleUser(text) {
    addMsg(text, "user");
    state.transcript.push({ role: "user", text: text });
    clearChips();

    if (state.finished) {            // after handoff, keep answering via AI
      answerFreeform(text, null);
      return;
    }

    var step = STEPS[state.stepIndex];

    // If they ask a question instead of answering, let the AI help, then re-ask.
    if (step && looksLikeQuestion(text) && CONFIG.aiEndpoint) {
      answerFreeform(text, function () { reAsk(step); });
      return;
    }

    // Validate phone
    if (step && step.validate === "phone" && !/[0-9][0-9\s().-]{7,}/.test(text)) {
      botSay("That doesn't look like a full phone number — could you pop it in again? 📱", function () { });
      return;
    }

    // Store answer + advance
    if (step) {
      if (!(step.optional && /^skip$/i.test(text))) state.data[step.key] = text;
      state.stepIndex++;
      askStep();
    } else {
      answerFreeform(text, null);
    }
  }

  function reAsk(step) {
    var prompt = (step.reask || step.prompt).replace("{name}", state.data.name ? " " + state.data.name : "");
    botSay("Happy to help with anything else too. 👍 " + prompt, function () {
      if (step.chips) {
        setChips(step.chips.map(function (label) {
          return { label: label, onClick: function () { handleUser(label); } };
        }));
      }
    });
  }

  /* ------------------------------------------------- AI (Gemini proxy) */
  function answerFreeform(text, done) {
    if (!CONFIG.aiEndpoint) {
      botSay("Good question! The team can go through the detail with you directly — let's get your enquiry to them. 😊", done);
      return;
    }
    state.busy = true;
    typing(true);
    var payload = {
      message: text,
      history: state.transcript.slice(-12),
      context: state.data
    };
    fetch(CONFIG.aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error("ai " + r.status); return r.json(); })
      .then(function (j) {
        typing(false); state.busy = false; state.aiAvailable = true; state.mode = "ai";
        var reply = (j && j.reply) ? j.reply : "Let me get the team to help you with that.";
        addMsg(reply, "bot");
        state.transcript.push({ role: "model", text: reply });
        if (done) done();
      })
      .catch(function () {
        typing(false); state.busy = false; state.aiAvailable = false;
        // graceful fallback — answer generically and carry on capturing
        botSay("Good question — the team can confirm the exact detail for you. Let's make sure they get your enquiry. 😊", done);
      });
  }

  /* ---------------------------------------------------- finish + handoff */
  function finish() {
    state.finished = true;
    var d = state.data;
    var summary =
      "Perfect — here's what I've got:\n\n" +
      "• Service: " + (d.service || "—") + "\n" +
      "• Name: " + (d.name || "—") + "\n" +
      "• Phone: " + (d.phone || "—") + "\n" +
      "• Area: " + (d.area || "—") + "\n" +
      "• Urgency: " + (d.urgency || "—") +
      (d.details ? "\n• Notes: " + d.details : "");
    botSay(summary, function () {
      var emergency = /emergency/i.test(d.urgency || "") || /lockout/i.test(d.service || "");
      botSay(
        emergency
          ? "That sounds urgent. ⚡ Tap below to send these details to our team on WhatsApp right now — or call us straight away, we answer 24/7."
          : "Tap below to send these details to our team on WhatsApp and we'll be in touch shortly. 👇",
        function () {
          saveToBackup();   // email/Netlify backup fires immediately
          var chips = [
            { label: "📲 Send to team on WhatsApp", cls: "go", onClick: openWhatsApp },
            { label: "📞 Call " + CONFIG.emergencyPhoneLabel, cls: "call", onClick: function () { location.href = "tel:" + CONFIG.emergencyPhone; } }
          ];
          setChips(chips);
        });
    });
  }

  function buildMessage() {
    var d = state.data;
    var lines = [
      "New website enquiry — " + CONFIG.businessName,
      "--------------------------------",
      "Service: " + (d.service || "—"),
      "Name: " + (d.name || "—"),
      "Phone: " + (d.phone || "—"),
      "Area: " + (d.area || "—"),
      "Urgency: " + (d.urgency || "—")
    ];
    if (d.details) lines.push("Notes: " + d.details);
    // include a short transcript for extra context
    var convo = state.transcript
      .filter(function (m) { return m.text; })
      .slice(-12)
      .map(function (m) { return (m.role === "user" ? "Customer: " : "Assistant: ") + m.text; })
      .join("\n");
    lines.push("", "— Conversation —", convo);
    return lines.join("\n");
  }

  function openWhatsApp() {
    var url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(buildMessage());
    window.open(url, "_blank");
    botSay("Opening WhatsApp so you can send your details with one tap. ✅ If it didn't open, just call us on " + CONFIG.emergencyPhoneLabel + ". Is there anything else I can help with?", function () { clearChips(); });
  }

  /* Email/form backup via Netlify Forms (works once hosted on Netlify) */
  function saveToBackup() {
    var d = state.data;
    var body = new URLSearchParams();
    body.append("form-name", CONFIG.formName);
    body.append("service", d.service || "");
    body.append("name", d.name || "");
    body.append("phone", d.phone || "");
    body.append("area", d.area || "");
    body.append("urgency", d.urgency || "");
    body.append("details", d.details || "");
    body.append("transcript", state.transcript.map(function (m) {
      return (m.role === "user" ? "Customer: " : "Assistant: ") + m.text;
    }).join("\n"));
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .catch(function () { /* backup is best-effort; WhatsApp is the primary path */ });
  }

  /* ---------------------------------------------------------- boot */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else { build(); }
})();
