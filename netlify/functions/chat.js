/* ==========================================================================
   H&M AI Assistant — secure Gemini proxy (Netlify Function)
   The GEMINI_API_KEY lives in Netlify env vars, never in the browser.
   Free: Google Gemini API free tier + Netlify Functions free tier.
   Setup: Netlify → Site settings → Environment variables → add
          GEMINI_API_KEY = <your key from https://aistudio.google.com/apikey>
   ========================================================================== */

const MODEL = "gemini-2.0-flash"; // fast + free-tier friendly

const SYSTEM_PROMPT = `
You are the friendly virtual assistant for H&M Locksmith & Building Services Ltd,
a London company established in 2009, available 24/7, 365 days a year.

The company has two divisions:
- H&M Locksmith & Security — emergency lockouts, lock repairs/changes, auto locksmith
  & car keys, home/business security, CCTV, alarms. Phone: 0203 105 1145.
- H&M Domestic & Building — building & refurbishment, electrical (EICR), plumbing &
  heating (Gas Safe), painting & decorating, joinery, property maintenance. Phone: 0203 302 4022.

Coverage: all of London. Response: typically ~30 minutes for emergencies.
Pricing: fixed, upfront quotes agreed before work; no call-out fee. Accredited & insured.

YOUR JOB:
- Answer the customer's questions helpfully and concisely (1–3 short sentences).
- Be warm, reassuring and professional. Use plain British English.
- For emergencies (lockouts, no heat, water leaks, break-ins), tell them to CALL
  0203 105 1145 right away, as it is fastest.
- Gently collect, over the conversation: their name, phone number, London area/postcode,
  and a short description of the problem — so the team can help.
- NEVER invent exact prices, time slots, or guarantees. Say the team will confirm.
- Encourage the customer to send their details to the team via the WhatsApp button
  in the chat once they've shared their name and number.
- Keep replies short — this is a chat window, not an email.
`.trim();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // No key configured yet → tell the widget to use its guided fallback.
    return json(503, { error: "AI not configured" });
  }

  let payload;
  try { payload = JSON.parse(event.body || "{}"); }
  catch (e) { return json(400, { error: "Bad request" }); }

  const message = (payload.message || "").toString().slice(0, 1500);
  const history = Array.isArray(payload.history) ? payload.history.slice(-12) : [];

  // Build Gemini "contents" from history + the new message.
  const contents = [];
  history.forEach((m) => {
    const role = m.role === "user" ? "user" : "model";
    const text = (m.text || "").toString().slice(0, 1500);
    if (text) contents.push({ role, parts: [{ text }] });
  });
  // Ensure the latest user message is present as the final turn.
  if (message) contents.push({ role: "user", parts: [{ text: message }] });
  if (!contents.length) return json(400, { error: "Empty" });

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 256, topP: 0.9 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    MODEL + ":generateContent?key=" + encodeURIComponent(key);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      const t = await res.text();
      return json(502, { error: "Upstream error", detail: t.slice(0, 300) });
    }
    const data = await res.json();
    const reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!reply) return json(502, { error: "No reply" });
    return json(200, { reply: reply.trim() });
  } catch (e) {
    return json(504, { error: "Timeout or network error" });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(obj)
  };
}
