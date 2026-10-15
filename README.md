# H&M Locksmith & Building Services — Website

A fast, secure, **static** website for H&M Locksmith & Building Services Ltd (London).
Built with plain HTML, CSS and vanilla JavaScript — **no WordPress, no database, no plugins** —
so it's fast, cheap to host, and can't be hacked the way the old WordPress site was.

> Replaces the previous WordPress site (which had spam/casino content injected into it —
> a sign it had been compromised).

---

## 📁 Project structure

```
HM-Locksmith/
├── index.html            # Home
├── about.html            # About us
├── services.html         # All services (both divisions)
├── locksmith.html        # Locksmith & Security division (SEO landing page)
├── building.html         # Domestic & Building division (SEO landing page)
├── contact.html          # Contact + quote form
├── thank-you.html        # Form success page
├── 404.html              # Not-found page
├── robots.txt            # Search engine rules
├── sitemap.xml           # Search engine sitemap
├── netlify.toml          # Netlify hosting config (headers, 404)
├── assets/
│   ├── css/styles.css    # All styling (design system)
│   ├── js/main.js        # Menu, FAQ, animations, form handling
│   └── images/           # Photos + favicon (see "Images" below)
└── README.md
```

---

## 🚀 Deploying to Netlify (free)

1. Go to **app.netlify.com** → **Add new site** → **Import an existing project**.
2. Connect **GitHub** and pick the **`nexvisionuk-spec/HM-Locksmith`** repo.
3. Build settings (Netlify reads these from `netlify.toml`, but to confirm):
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.` (the repo root)
4. Click **Deploy**. You'll get a temporary URL like `random-name.netlify.app`.

### Pointing the real domain (`hmlocksmithandbuildingservices.co.uk`)

1. In Netlify: **Site settings → Domain management → Add a custom domain** →
   enter `hmlocksmithandbuildingservices.co.uk`.
2. Netlify shows the DNS records to set. At the **domain registrar** (where the domain
   is managed), either:
   - point the nameservers to Netlify (easiest), **or**
   - add an `A` record for `@` → Netlify's load-balancer IP and a `CNAME` for `www`.
3. Netlify issues a free **HTTPS (SSL) certificate** automatically once DNS resolves.

> Set `www` as the primary and redirect the apex, or vice-versa — Netlify handles the redirect.

---

## 📨 Contact & quote forms

The forms use **Netlify Forms** (free, no backend needed). They work automatically once
the site is hosted on Netlify — submissions appear in **Netlify → Forms**, and you can set
up **email notifications** there (Site settings → Forms → Form notifications).

Each form already includes:
- `data-netlify="true"` and a hidden `form-name` field (required by Netlify).
- A honeypot anti-spam field.
- Redirect to `thank-you.html` on success.

If you host somewhere **other than Netlify**, the forms need a different handler
(e.g. Formspree) — just change the `action` and remove the Netlify attributes.

---

## 🤖 AI Assistant (chatbot) — free, 24/7 lead capture

A chat widget (bottom-right on every page) greets visitors, answers their
questions, collects their details, and **sends the enquiry to the owner's
WhatsApp** — with an **email/form backup** so no lead is ever lost. It runs 24/7
and costs nothing.

**Files:** `assets/js/chatbot.js`, `assets/css/chatbot.css`,
`netlify/functions/chat.js` (the secure AI proxy).

### 1. Set the owner's WhatsApp number (required)
Open `assets/js/chatbot.js` and edit the `CONFIG` block at the top:
```js
whatsapp: "447956128990",   // owner's WhatsApp, international format, digits only
```
UK mobile `07956 128990` → `447956128990` (drop the leading 0, add `44`).
> Currently set to the old site's mobile (07956 128 990) as a placeholder — **confirm/replace it.**
> ⚠️ WhatsApp needs a **mobile** number that has WhatsApp installed — the 0203 landlines won't work.

### 2. Turn on the real AI (Google Gemini — free tier)
Without a key, the bot runs a friendly **guided Q&A** (still captures leads).
To enable natural AI answers:
1. Get a free API key at **https://aistudio.google.com/apikey** (Google account needed).
2. In **Netlify → Site settings → Environment variables**, add:
   - **Key:** `GEMINI_API_KEY`  **Value:** *your key*
3. Redeploy (Netlify → Deploys → Trigger deploy). Done.

The key lives only on Netlify's servers (in the function) — it's **never** exposed
in the website code. Uses `gemini-2.0-flash` on the free tier; the function
automatically falls back to the guided flow if the key is missing or a limit is hit.

### Where the leads go
- **WhatsApp:** the customer taps "Send to team on WhatsApp" and the full enquiry +
  chat transcript arrives on the owner's WhatsApp.
- **Email/dashboard backup:** every chat lead is also posted to **Netlify → Forms**
  (form name `chatbot-lead`). Set up email alerts in Site settings → Forms → notifications.

### Upgrade later (optional)
To auto-send to WhatsApp without the customer tapping (true "push"), you'd add the
WhatsApp Business API (e.g. via Twilio) — that's a paid service and a later step.

---

## 🖼️ Images — temporary, swap when ready

All photos in `assets/images/` are **professional royalty-free placeholders** (from Unsplash).
They're relevant but generic — replace them with H&M's own photos when available.
**Keep the same filenames** and the site updates with zero code changes:

| File | Used for |
|------|----------|
| `hero.jpg` | Homepage hero background |
| `locksmith.jpg` | Locksmith page hero + home tile |
| `autolocksmith.jpg` | Auto locksmith |
| `security.jpg` | Home & business security |
| `cctv.jpg` | CCTV & alarms |
| `building.jpg` | Building page hero + home tile |
| `electrical.jpg` | Electrical |
| `heating-plumbing.jpg` | Plumbing & heating |
| `painting.jpg` | Painting & decorating |
| `joinery.jpg` | Bespoke joinery |
| `refurbishment.jpg` | About / building "landlords" section |
| `team.jpg` | "Why choose us" / about |
| `emergency.jpg` | Spare (night/emergency) |
| `favicon.svg` | Browser tab icon / logo mark |

Tip: keep replacements roughly landscape and compress them (e.g. tinypng.com) for speed.

---

## 🔍 SEO notes (why the site wasn't showing up)

Already built in:
- Unique **title** + **meta description** on every page, targeting London + service keywords.
- **LocalBusiness / Locksmith schema** (JSON-LD) with address, phone, hours, rating.
- `sitemap.xml` + `robots.txt`, Open Graph tags, semantic headings, fast static pages, mobile-first.

**Still to do (owner/marketing):**
1. **Google Business Profile** — claim/verify it; this is the #1 driver of local visibility.
2. Submit the site + sitemap in **Google Search Console** (search.google.com/search-console).
3. Get listed/consistent on directories (Checkatrade, Yell, etc.) with the **same** name,
   address & phone (NAP) as the site.
4. Gather Google reviews.
5. Google Ads review — to be done after launch (as discussed).

---

## ⚠️ Please verify before go-live

These were taken from the existing sites — confirm they're current & accurate:
- **Accreditations claimed:** NICEIC, Gas Safe, SafeContractor, FIRAS, "fully insured".
  Only keep badges the business genuinely holds (false claims are a legal/trust risk).
- **Phone numbers & emails** for each division (used throughout the site).
- **Addresses** (office 124 Wilton Road SW1V 1AJ; store 609 Harrow Road W10 4RA).
- Testimonials: Margaret Collins is from the old site; the other two are **illustrative
  examples** — replace with real, attributable reviews before launch.

---

## 🛠️ Editing the site

It's plain HTML — open any `.html` file and edit the text. Shared pieces (header, footer,
phone numbers) are repeated in each file, so if you change a phone number, update it across
all pages (search & replace). Styling lives entirely in `assets/css/styles.css`.
