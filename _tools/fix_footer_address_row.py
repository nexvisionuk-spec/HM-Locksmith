# -*- coding: utf-8 -*-
"""
Put the footer 'Office' and 'Store' address blocks on the same line (side by side)
instead of Office in the brand column and Store lower down in the Contact column.

Runs across every page; skips any file where the pattern isn't found exactly once.
"""
import os, re, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEAD = (r'<div class="sc_layouts_item elementor-element elementor-element-[0-9a-f]+ '
        r'sc_fly_static elementor-widget elementor-widget-heading" data-id="[0-9a-f]+"[^>]*>\s*'
        r'<h6 class="elementor-heading-title elementor-size-default">%s</h6>\s*</div>')

def text_block(street, postcode):
    """Exact address paragraph — NO cross-paragraph wildcards (that caused a mix-up)."""
    return (r'<div class="sc_layouts_item elementor-element elementor-element-[0-9a-f]+ '
            r'sc_fly_static elementor-widget elementor-widget-text-editor" data-id="[0-9a-f]+"[^>]*>\s*'
            r'<p[^>]*><strong[^>]*>United Kingdom, London</strong>'
            r'<br[^>]*/>' + re.escape(street) + r'<br[^>]*/>' + re.escape(postcode) + r'</p>\s*</div>')

OFFICE_H6 = re.compile(HEAD % "Office", re.S)
OFFICE_P  = re.compile(text_block("124 Wilton Road", "SW1V 1AJ"), re.S)
STORE_H6  = re.compile(HEAD % "Store", re.S)
STORE_P   = re.compile(text_block("609 Harrow Road", "W10 4RA"), re.S)

ROW_OPEN = ('<div class="footer-address-row" style="display:flex;gap:34px;flex-wrap:wrap;'
            'width:100%;align-items:flex-start">'
            '<div class="footer-address-col" style="flex:1 1 0;min-width:150px">')
COL_SPLIT = '</div><div class="footer-address-col" style="flex:1 1 0;min-width:150px">'
ROW_CLOSE = '</div></div>'


def transform(s):
    oh = OFFICE_H6.search(s); op = OFFICE_P.search(s)
    sh = STORE_H6.search(s);  sp = STORE_P.search(s)
    if not all([oh, op, sh, sp]):
        return s, "pattern not found"
    if s.count(OFFICE_H6.pattern) > 0 and len(OFFICE_H6.findall(s)) != 1:
        return s, "office heading appears more than once"
    if len(OFFICE_P.findall(s)) != 1 or len(STORE_P.findall(s)) != 1:
        return s, "address block appears more than once"

    office_block = oh.group(0) + op.group(0)
    store_block  = sh.group(0) + sp.group(0)

    # hard safety: never mix the two addresses
    assert "124 Wilton Road" in office_block and "609 Harrow Road" not in office_block, "office block corrupted"
    assert "609 Harrow Road" in store_block and "124 Wilton Road" not in store_block, "store block corrupted"

    # a) remove the Store heading AND its address paragraph from the Contact column
    assert sh.end() <= sp.start(), "store heading/paragraph out of order"
    s = s[:sh.start()] + s[sp.end():]
    # recompute after removal
    op = OFFICE_P.search(s); oh = OFFICE_H6.search(s)
    start, end = oh.start(), op.end()

    # b) put both blocks in one flex row where Office used to be
    row = ROW_OPEN + office_block + COL_SPLIT + store_block + ROW_CLOSE
    s = s[:start] + row + s[end:]

    # post-checks
    assert s.count(">Office</h6>") == 1 and s.count(">Store</h6>") == 1, "heading count wrong"
    assert len(OFFICE_P.findall(s)) == 1 and len(STORE_P.findall(s)) == 1, "address block count wrong"
    assert s.index("124 Wilton Road") < s.index("609 Harrow Road"), "office/store order wrong"
    return s, "ok"


def main():
    files = sorted(f for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
                   if "wp-content" not in f and "wp-includes" not in f)
    changed = 0
    for f in files:
        s = open(f, encoding="utf-8", errors="strict").read()
        out, status = transform(s)
        rel = os.path.relpath(f, ROOT)
        if out != s:
            open(f, "w", encoding="utf-8", newline="").write(out)
            changed += 1
            print(f"  OK      {rel}")
        else:
            print(f"  skipped {rel}  ({status})")
    print(f"\nfiles changed: {changed}")

if __name__ == "__main__":
    main()
