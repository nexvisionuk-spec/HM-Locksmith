# H&M Locksmith & Building Services — website

Static site hosted on Netlify (publish directory `.`, no build step).

**Status:** the previous design has been removed and the site is being rebuilt from scratch.
The full previous build (all pages, styles, images) remains in the git history and can be
restored at any time (e.g. `git checkout <old-commit> -- <file>`).

## What is kept
- `index.html` — temporary holding page that hosts the chatbot.
- `assets/js/chatbot.js` + `assets/css/chatbot.css` — "Harry" assistant.
- `netlify/functions/chat.js` — Netlify Function proxying to Google Gemini
  (`gemini-2.0-flash`, env var `GEMINI_API_KEY`); falls back to guided chat when no key.
- `assets/images/logo-badge.svg`, `assets/images/favicon.svg`.
- `netlify.toml`, `robots.txt`, `.gitignore`.

## Chatbot notes
- Owner WhatsApp is set in the `CONFIG` block at the top of `assets/js/chatbot.js`.
- Chat leads also post to **Netlify → Forms** (form name `chatbot-lead`); the hidden
  capture form lives in `index.html` and must be present on any page that hosts the chatbot.
- To enable real AI answers, add `GEMINI_API_KEY` in Netlify → Site settings → Environment variables.

## Notes
- `robots.txt` currently **disallows indexing** while the new site is built — revert when ready.
- Netlify auto-deploys from `main`.
