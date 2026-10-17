"""
Local dev server for the H&M site that ALSO runs the Gemini chat proxy,
so the AI chatbot can be tested in the local preview.

Mirrors netlify/functions/chat.js:
  POST /.netlify/functions/chat  ->  Gemini gemini-flash-latest  ->  {"reply": "..."}

The API key is read from _tools/.gemini_key (git-ignored) or the
GEMINI_API_KEY environment variable. It is NEVER written into the site.

Usage:  python _tools/dev_server.py [port]     (default 8099)
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_FILE = os.path.join(ROOT, "_tools", ".gemini_key")
MODEL = "gemini-flash-latest"

SYSTEM_PROMPT = """
You are "Harry", the friendly virtual assistant for H&M Locksmith & Building Services Ltd,
a London company established in 2009, available 24/7, 365 days a year.

The company has two divisions:
- H&M Locksmith & Security — emergency lockouts, lock repairs/changes, auto locksmith
  & car keys, home/business security, CCTV, alarms. Phone: 0203 105 1145.
- H&M Domestic & Building — building & refurbishment, electrical (EICR), plumbing &
  heating (Gas Safe), painting & decorating, joinery, property maintenance. Phone: 0203 302 4022.

Coverage: all of London. Response: typically ~30 minutes for emergencies.
Pricing: fixed, upfront quotes agreed before work; no call-out fee. Accredited & insured.

YOUR JOB:
- Answer the customer's questions helpfully and concisely (1-3 short sentences).
- Be warm, reassuring and professional. Use plain British English.
- For emergencies (lockouts, no heat, water leaks, break-ins), tell them to CALL
  0203 105 1145 right away, as it is fastest.
- Gently collect, over the conversation: their name, phone number, London area/postcode,
  and a short description of the problem - so the team can help.
- NEVER invent exact prices, time slots, or guarantees. Say the team will confirm.
- Encourage the customer to send their details to the team via the WhatsApp button
  in the chat once they've shared their name and number.
- Keep replies short - this is a chat window, not an email.
""".strip()


def get_key():
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        return k
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""


def ask_gemini(message, history):
    key = get_key()
    if not key:
        return 503, {"error": "AI not configured"}

    contents = []
    for m in (history or [])[-12:]:
        role = "user" if m.get("role") == "user" else "model"
        text = str(m.get("text", ""))[:1500]
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})
    if message:
        msg = message[:1500]
        # history may already end with this same user turn — don't duplicate it
        last = contents[-1] if contents else None
        if not (last and last["role"] == "user" and last["parts"][0].get("text") == msg):
            contents.append({"role": "user", "parts": [{"text": msg}]})
    if not contents:
        return 400, {"error": "Empty"}

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.6, "maxOutputTokens": 400, "topP": 0.9,
                             "thinkingConfig": {"thinkingBudget": 0}},
        "safetySettings": [
            {"category": c, "threshold": "BLOCK_ONLY_HIGH"}
            for c in ("HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
                      "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT")
        ],
    }
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{MODEL}:generateContent?key={urllib.parse.quote(key)}")
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return 502, {"error": "Upstream error", "detail": e.read().decode("utf-8", "replace")[:300]}
    except Exception as e:
        return 504, {"error": "Timeout or network error", "detail": str(e)[:200]}

    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return 502, {"error": "No reply", "detail": json.dumps(data)[:300]}
    return 200, {"reply": reply.strip()}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def _send_json(self, status, obj):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        if self.path.split("?")[0] in ("/.netlify/functions/chat", "/api/chat"):
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b"{}"
            try:
                payload = json.loads(raw.decode("utf-8") or "{}")
            except Exception:
                return self._send_json(400, {"error": "Bad request"})
            status, obj = ask_gemini(payload.get("message", ""), payload.get("history", []))
            return self._send_json(status, obj)
        self._send_json(404, {"error": "Not found"})

    def end_headers(self):
        # avoid stale preview during development
        if self.path.endswith((".html", ".css", ".js")) or self.path in ("/", ""):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving {ROOT} on http://127.0.0.1:{port}  (chat proxy: /{'.netlify/functions/chat'})")
    srv.serve_forever()
