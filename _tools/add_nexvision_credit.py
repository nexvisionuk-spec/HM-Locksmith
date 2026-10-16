"""Add the NexVision credit link next to the empty 'Site by' footer text.

Original markup:
  <span class="...">Site by</span>
New markup:
  <span class="...">Site by <a href="https://nexvision.uk/" target="_blank"
  rel="noopener" class="hm-credit-link">NexVision</a></span>

Idempotent: skips pages where the link is already present.
"""
import os, sys, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OLD = '<span class="trx-addons-advanced-title-item trx-addons-advanced-title-item-text elementor-repeater-item-b6da17f">Site by</span>'
NEW = ('<span class="trx-addons-advanced-title-item trx-addons-advanced-title-item-text elementor-repeater-item-b6da17f">'
       'Site by <a href="https://nexvision.uk/" target="_blank" rel="noopener" class="hm-credit-link">NexVision</a>'
       '</span>')

updated, skipped = 0, 0
for path in ROOT.rglob('*.html'):
    if '_tools' in path.parts or '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8', errors='replace')
    if 'hm-credit-link' in text:           # already applied
        skipped += 1; continue
    if OLD not in text:
        continue
    new_text = text.replace(OLD, NEW)
    assert new_text.count(NEW) == 1, f"more than one match in {path}"
    assert '>NexVision</a>' in new_text, "credit link missing after replace"
    path.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  updated  {path.relative_to(ROOT)}')

print(f'\n{updated} updated, {skipped} already had the link')
