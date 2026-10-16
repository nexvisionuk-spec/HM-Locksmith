"""Replace the empty ReviewStack widget (elementor-element-1176afb) on every
page that has it with real customer testimonials from both branches, pulled
from the public Google review links the owner supplied.
"""
import re, pathlib, html

ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")

STORE_CID  = "2993071067314997529"   # H&M Locksmith and Security LTD (Store, 609 Harrow Rd)
OFFICE_CID = "1214119125620460867"   # H & M Locksmith and Building Services LTD (Office, 124 Wilton Rd)
STORE_URL  = f"https://www.google.com/maps?cid={STORE_CID}"
OFFICE_URL = f"https://www.google.com/maps?cid={OFFICE_CID}"

# Real reviews pulled from the public share links the owner provided
REVIEWS = [
    # Store (Harrow Rd) branch
    {"name": "Leanne M.", "when": "7 months ago", "branch": "Store", "url": STORE_URL,
     "text": "Fast, professional, and reliable! I was locked out and they arrived quickly, got me back inside without any damage, and the price was exactly what they quoted. Great customer service — highly recommend!"},
    {"name": "Tina Bolesful", "when": "4 months ago", "branch": "Store", "url": STORE_URL,
     "text": "Came within half an hour. Very quick work. Smooth, polite gentleman. On a bank holiday weekend too. Will always recommend these fellows."},
    {"name": "Nails Brows", "when": "a week ago", "branch": "Store", "url": STORE_URL,
     "text": "We had an emergency at our store in Mayfair when a delivery driver accidentally broke the large glass panel by the entrance. The team were exceptionally responsive, professional and helpful, and secured our shop-front glass as quickly as possible. Excellent service, fast response and very professional."},
    # Office (Wilton Rd / Pimlico) branch
    {"name": "Claudio Pezzin", "when": "a week ago", "branch": "Office", "url": OFFICE_URL,
     "text": "Night latch failed but the locksmith arrived within 15 minutes as promised. Reasonable price and great service."},
    {"name": "Abdi Warsame", "when": "2 months ago", "branch": "Office", "url": OFFICE_URL,
     "text": "I had an excellent experience with H & M Locksmith. They arrived within about 15 minutes, which was impressive. I had lost my key and needed my door lock replaced urgently — handled quickly, professionally, and with no hassle at all. Efficient, friendly and reliable from start to finish."},
]

def initials(name):
    parts = [p for p in name.replace(".", "").split() if p]
    if not parts: return "?"
    if len(parts) == 1: return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()

def card_html(r):
    return (
        '\t<div class="hm-t-card">\n'
        '\t\t<div class="hm-t-head">\n'
        f'\t\t\t<div class="hm-t-avatar" aria-hidden="true">{html.escape(initials(r["name"]))}</div>\n'
        '\t\t\t<div>\n'
        f'\t\t\t\t<div class="hm-t-name">{html.escape(r["name"])}</div>\n'
        f'\t\t\t\t<div class="hm-t-when">{html.escape(r["when"])}</div>\n'
        '\t\t\t</div>\n'
        '\t\t</div>\n'
        '\t\t<div class="hm-t-stars" aria-label="5 out of 5 stars">\u2605\u2605\u2605\u2605\u2605</div>\n'
        f'\t\t<p class="hm-t-text">{html.escape(r["text"])}</p>\n'
        '\t\t<div class="hm-t-branch">\n'
        f'\t\t\t<span>Branch: <strong>{html.escape(r["branch"])}</strong></span>\n'
        f'\t\t\t<a class="hm-t-google" href="{html.escape(r["url"])}" target="_blank" rel="noopener">Verified Google review \u2197</a>\n'
        '\t\t</div>\n'
        '\t</div>\n'
    )

cards = "".join(card_html(r) for r in REVIEWS)
INNER = (
    '<div class="hm-testimonials">\n'
    + cards +
    '</div>\n'
    '<div class="hm-reviews-cta">\n'
    f'\t<a href="{STORE_URL}" target="_blank" rel="noopener">\u2605 Store reviews on Google (H&amp;M Locksmith and Security LTD)</a>\n'
    f'\t<a class="hm-reviews-cta-ghost" href="{OFFICE_URL}" target="_blank" rel="noopener">\u2605 Office reviews on Google (H &amp; M Locksmith and Building Services LTD)</a>\n'
    '</div>'
)

# Replace the ReviewStack pixel + custom element block with our testimonials.
# Keep the outer Elementor widget div untouched; just swap what's inside.
OPEN_RE = re.compile(
    r'<!-- Review Pixel -->\s*<script>.*?</script>\s*<emr-simple-carousel[^>]*></emr-simple-carousel>\s*<!-- Review Pixel End -->',
    re.DOTALL,
)

updated = 0
for path in sorted(ROOT.rglob("*.html")):
    if "_tools" in path.parts or ".git" in path.parts:
        continue
    t = path.read_text(encoding="utf-8", errors="replace")
    if "emr-simple-carousel" not in t:
        continue
    if "hm-testimonials" in t:
        print(f"  SKIP (already) {path.relative_to(ROOT)}")
        continue
    nt, n = OPEN_RE.subn(INNER, t, count=1)
    if n != 1:
        print(f"  WARN no match in {path.relative_to(ROOT)}")
        continue
    path.write_text(nt, encoding="utf-8")
    updated += 1
    print(f"  updated  {path.relative_to(ROOT)}")

print(f"\n{updated} page(s) updated")
