"""Two fixes:
1) Move hm-locations-row out of the bottom bar (it got injected into the
   Site by span) and place it BEFORE the map iframe (which already sits
   between the columns row and the bottom bar - that's where we want it).
2) Replace the iframe src with a Google Maps embed URL that always renders
   reliably (use a single quoted search query containing both addresses,
   no pipe-separator, no t=k satellite - that's the format Google accepts
   without an API key).
"""
import re, pathlib

ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")

# Map iframe container: matches the exact div we want to anchor on
MAP_OPEN = '<div class="elementor-element elementor-element-hm-footer-map'

# Build regex to capture the entire <div ... hm-footer-map ...>...</div>
# block (single-level, no nested divs of the same kind - the iframe is the
# only child).
LOCATIONS_AND_MAP_RE = re.compile(
    r'\n[ \t]*<div[^>]*data-id="hm-locations"[^>]*>.*?</div>',
    re.DOTALL,
)

# New iframe src - the most reliable Google Maps embed format:
# https://www.google.com/maps?q=ENCODED_ADDRESS&output=embed
# Use a single quoted search query with both addresses as a phrase.
MAP_SRC = (
    "https://www.google.com/maps?q=H%26M+Group,+124+Wilton+Road,+London"
    "+SW1V+1AJ%7CH%26M+Store,+609+Harrow+Road,+London+W10+4RA"
    "&z=11&output=embed"
)

updated = 0
for path in sorted(ROOT.rglob("*.html")):
    if "_tools" in path.parts or ".git" in path.parts:
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text

    # 1) Remove the locations block (it was injected into the bottom bar
    #    in the wrong place).
    text, n_loc = LOCATIONS_AND_MAP_RE.subn("\n", text, count=1)
    if n_loc != 1:
        print(f"  WARN locations block found {n_loc} times in {path.relative_to(ROOT)}")

    # 2) Fix the iframe src - replace the existing iframe src with the
    #    reliable format.
    text = re.sub(
        r'(<iframe class="hm-map-iframe"[^>]*?src=")[^"]+(")',
        lambda m: m.group(1) + MAP_SRC + m.group(2),
        text,
        count=1,
    )

    # 3) Re-inject the locations block directly BEFORE the map iframe
    #    container, so the order becomes:
    #       columns row
    #       locations row  <-- new position (middle area)
    #       map iframe
    #       bottom bar
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
    if MAP_OPEN in text:
        text = text.replace(MAP_OPEN, LOCATIONS_HTML + "\t\t" + MAP_OPEN, 1)
    else:
        print(f"  WARN map container not found in {path.relative_to(ROOT)}")

    if text != original:
        path.write_text(text, encoding="utf-8")
        updated += 1
        print(f"  fixed  {path.relative_to(ROOT)}")

print(f"\n{updated} file(s) fixed")
