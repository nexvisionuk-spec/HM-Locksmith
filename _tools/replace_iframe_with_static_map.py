"""Replace the Google Maps iframe in every page with a clickable static-map
image (real, rendered, no JS needed). The image opens Google Maps for
directions when clicked. Image lives at assets/img/hm-locations-map.jpg."""
import re, pathlib

ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")

# Match the entire <div class="...hm-footer-map..."><iframe...></iframe></div>
# block. We delete it and replace with a clickable <a><img>...</a>.
IFRAME_BLOCK_RE = re.compile(
    r'<div[^>]*data-id="hm-footer-map"[^>]*>.*?</iframe>\s*</div>\s*</div>',
    re.DOTALL,
)

# Static map: <a href="..."><img ...></a>
# Wrap the image in a link to Google Maps directions between the two locations.
MAP_LINK = (
    'https://www.google.com/maps/dir/?api=1'
    '&origin=124+Wilton+Road+London+SW1V+1AJ'
    '&destination=609+Harrow+Road+London+W10+4RA'
)

NEW_MAP_HTML = (
    '\n\t\t<div class="elementor-element elementor-element-hm-footer-map '
    'e-con-full hm-footer-map e-flex e-con" data-id="hm-footer-map" '
    'data-element_type="container" data-e-type="container">\n'
    '\t\t\t<a class="hm-map-link" href="' + MAP_LINK + '" target="_blank" '
    'rel="noopener" aria-label="Open H&M Group locations in Google Maps">\n'
    '\t\t\t\t<img class="hm-map-img" src="/assets/img/hm-locations-map.jpg" '
    'alt="H&M Group office and store locations on map - 124 Wilton Road '
    'and 609 Harrow Road, London" loading="lazy" decoding="async" '
    'width="1100" height="700">\n'
    '\t\t\t</a>\n'
    '\t\t</div>\n'
)

updated = 0
for path in sorted(ROOT.rglob("*.html")):
    if "_tools" in path.parts or ".git" in path.parts:
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    new_text, n = IFRAME_BLOCK_RE.subn(NEW_MAP_HTML.strip(), text, count=1)
    if n == 0:
        # Maybe the iframe block has already been replaced once; check.
        if "hm-map-img" in text:
            continue
        print(f"  WARN iframe block not found in {path.relative_to(ROOT)}")
        continue
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        updated += 1
        print(f"  updated  {path.relative_to(ROOT)}")

print(f"\n{updated} file(s) updated")
