# -*- coding: utf-8 -*-
"""Point the dead '#' service menu links at the new pages, site-wide."""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LINKS = {
    "Home Security":      "/trades/home-security/",
    "CCTV &#038; Entry":  "/trades/cctv-entry/",
    "Painting":           "/trades/painting/",
    "Refurbishment":      "/trades/refurbishment/",
    "Building Services":  "/trades/building-services/",
    "Insurance Service":  "/trades/insurance-service/",
    "Technical Services": "/trades/technical-services/",
}

def fix(html_text):
    total = 0
    for label, path in LINKS.items():
        # <a href="#" ...><span class="trx-addons-menu-link-text trx-addons-submenu-link-text">LABEL</span></a>
        pat = re.compile(
            r'(<a href=")#("[^>]*>\s*<span[^>]*trx-addons-menu-link-text[^>]*>)'
            + re.escape(label) +
            r'(</span></a>)', re.S)
        html_text, n = pat.subn(lambda m: m.group(1) + path + m.group(2) + label + m.group(3), html_text)
        total += n
    return html_text, total

files = []
for pat in ("*.html", "*/index.html", "*/*/index.html", "*/*/*/index.html"):
    files.extend(glob.glob(os.path.join(ROOT, pat)))
files = sorted(set(f for f in files if "wp-content" not in f and "wp-includes" not in f))

grand = 0
for f in files:
    s = open(f, encoding="utf-8", errors="strict").read()
    out, n = fix(s)
    if n:
        if out != s:
            open(f, "w", encoding="utf-8", newline="").write(out)
        rel = os.path.relpath(f, ROOT)
        print(f"{n:>3} links fixed  {rel}")
        grand += n
    else:
        # report any remaining dead service links
        left = len(re.findall(r'href="#"[^>]*>.*?(?:Home Security|CCTV &#038; Entry|Painting|Refurbishment|Building Services|Insurance Service|Technical Services)', s, re.S))
        if left:
            print(f"    NO FIX ({left} left)  {os.path.relpath(f, ROOT)}")
print(f"\nTOTAL fixed: {grand}")
