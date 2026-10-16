"""Add a Google Maps satellite embed to the footer of every page, showing
both locations (Office + Store) as pins on one map.

Insertion point: as a sibling of the main columns row (data-id=34df354) and
the bottom bar (data-id=38cab91), inside the footer section. This places the
map at the bottom of the footer content, just above the copyright row.

Idempotent: skips pages where the hm-footer-map marker is already present.
"""
import os, sys, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ANCHOR = '<div class="elementor-element elementor-element-38cab91'
OLD_MARKER = 'hm-footer-map'

# Google Maps embed: both addresses joined by URL-encoded pipe (%7C).
# t=k -> satellite imagery, output=embed -> embeddable, z=11 -> zoom that
# shows both pins comfortably with London between them.
MAP_HTML = (
    '\n\t\t'
    '<div class="elementor-element elementor-element-hm-footer-map e-con-full '
    'hm-footer-map e-flex e-con" data-id="hm-footer-map" '
    'data-element_type="container" data-e-type="container">'
    '<iframe class="hm-map-iframe" '
    'src="https://www.google.com/maps?q=124+Wilton+Road,+London+SW1V+1AJ%7C'
    '609+Harrow+Road,+London+W10+4RA&amp;t=k&amp;z=11&amp;output=embed" '
    'width="100%" height="320" '
    'style="border:0;display:block;width:100%" '
    'loading="lazy" referrerpolicy="no-referrer-when-downgrade" '
    'allowfullscreen '
    'title="H&amp;M Group locations - Office (124 Wilton Road, London SW1V 1AJ) '
    'and Store (609 Harrow Road, London W10 4RA)"></iframe>'
    '</div>\n\t'
)

updated, skipped, missing_anchor = 0, 0, 0
for path in ROOT.rglob('*.html'):
    if '_tools' in path.parts or '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8', errors='replace')
    if OLD_MARKER in text:
        skipped += 1
        continue
    if ANCHOR not in text:
        missing_anchor += 1
        continue
    new_text = text.replace(ANCHOR, MAP_HTML + ANCHOR, 1)
    assert new_text.count('data-id="hm-footer-map"') == 1, f"map inserted more than once in {path}"
    assert 'href="https://nexvision.uk/"' in new_text, "NexVision credit was lost"
    assert new_text.count(MAP_HTML) == 1, "map HTML marker not unique"
    path.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  updated  {path.relative_to(ROOT)}')

print(f'\n{updated} updated, {skipped} already had the map, {missing_anchor} no footer found')
