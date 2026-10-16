"""Quick fix:
1) Move Office/Store text out of the brand column down to a new locations row
   that sits just above the bottom bar (so it shows in the marked area).
2) Replace the live Google Maps embed (t=k satellite) with a standard Google
   Maps embed that always renders something visible.
"""
import re, pathlib

ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")

# Anchor inside the bottom bar that appears EXACTLY once per page:
# the <a> tag that links to nexvision.uk in the Site by line.
ANCHOR = '<a href="https://nexvision.uk/"'

# Strip the in-brand Office + Store widgets from the brand column.
# Each is a single self-contained <div data-id="...">...</div> line.
TARGET_IDS = ("846af1f", "a431e9c", "7e7a0ea", "a7acabf")
STRIP_RE = re.compile(
    r'\n[ \t]*<div[^>]*data-id="(' + "|".join(TARGET_IDS) + r')"[^>]*>.*?</div>',
    re.DOTALL,
)

# New locations row - Office on left, Store on right.
LOCATIONS_HTML = (
    '\n\t\t<div class="elementor-element elementor-element-hm-locations '
    'e-flex e-con hm-locations-row" data-id="hm-locations" '
    'data-element_type="container" data-e-type="container">\n'
    '\t\t\t<div class="hm-locations-grid">\n'
    '\t\t\t\t<div class="hm-locations-col hm-locations-office">\n'
    '\t\t\t\t\t<h6 class="hm-locations-title">Office</h6>\n'
    '\t\t\t\t\t<p>United Kingdom, London<br>124 Wilton Road<br>SW1V&nbsp;1AJ</p>\n'
    '\t\t\t\t</div>\n'
    '\t\t\t\t<div class="hm-locations-col hm-locations-store">\n'
    '\t\t\t\t\t<h6 class="hm-locations-title">Store</h6>\n'
    '\t\t\t\t\t<p>United Kingdom, London<br>609 Harrow Road<br>W10&nbsp;4RA</p>\n'
    '\t\t\t\t</div>\n'
    '\t\t\t</div>\n'
    '\t\t</div>\n'
)

# Standard Google Maps embed (no satellite, no API key) - always renders.
# Two addresses joined by %7C (URL-encoded |), t=m (road view), z=11.
MAP_IFRAME_HTML = (
    '\n\t\t<div class="elementor-element elementor-element-hm-footer-map '
    'e-con-full hm-footer-map e-flex e-con" data-id="hm-footer-map" '
    'data-element_type="container" data-e-type="container">\n'
    '\t\t\t<iframe class="hm-map-iframe" loading="lazy" '
    'title="H&amp;M Group office and store locations" '
    'src="https://www.google.com/maps?q=124+Wilton+Road+London+SW1V+1AJ'
    '%7C609+Harrow+Road+London+W10+4RA&amp;t=m&amp;z=11&amp;output=embed" '
    'style="width:100%;height:320px;border:0;display:block;background:#1a1a1a;'
    'border-radius:6px"></iframe>\n'
    '\t\t</div>\n'
)

updated = 0
for path in sorted(ROOT.rglob("*.html")):
    if "_tools" in path.parts or ".git" in path.parts:
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text

    # Skip if already updated (idempotent).
    if "hm-locations" in text and 'q=124+Wilton' in text:
        continue

    # 1) Strip the in-brand Office/Store heading+address blocks (4 widgets).
    new_text, n = STRIP_RE.subn("\n", text, count=4)
    if n < 4:
        print(f"  WARN stripped only {n}/4 in {path.relative_to(ROOT)}")
    text = new_text

    # 2) Replace the old iframe (t=k satellite) with the standard embed.
    text = re.sub(
        r'<iframe class="hm-map-iframe"[^>]*?src="https://www\.google\.com/maps'
        r'\?q=[^"]+t=k[^"]*"[^>]*?></iframe>',
        MAP_IFRAME_HTML.strip(),
        text,
        count=1,
        flags=re.DOTALL,
    )

    # 3) Insert the new locations row directly above the bottom bar.
    if ANCHOR in text:
        text = text.replace(
            ANCHOR,
            LOCATIONS_HTML + "\t\t" + ANCHOR,
            1,
        )
    else:
        print(f"  WARN: anchor not found in {path.relative_to(ROOT)}")

    if text != original:
        path.write_text(text, encoding="utf-8")
        updated += 1
        print(f"  updated  {path.relative_to(ROOT)}")

print(f"\n{updated} file(s) updated")
