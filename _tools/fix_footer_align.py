# -*- coding: utf-8 -*-
"""
Fix the vertical offset between the footer 'Office' and 'Store' blocks.

Cause: Elementor generates per-element CSS with baked-in margins
(e.g. .elementor-element-7e7a0ea { margin-top: 65px }) based on where the widget
originally sat. The Store heading therefore started ~53px lower than Office.

Fix: inside the footer address row only, force margin-top:0 on the heading
widgets so both columns start on the same line.
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADING_DIV = re.compile(
    r'(<div class="sc_layouts_item elementor-element elementor-element-[0-9a-f]+ '
    r'sc_fly_static elementor-widget elementor-widget-heading" data-id="(?:846af1f|7e7a0ea)"[^>]*?)(>)')

def transform(s):
    if 'footer-address-row' not in s:
        return s, "no row"

    def add_style(m):
        tag = m.group(1) + m.group(2)
        if 'style=' in tag:
            return tag
        return m.group(1) + ' style="margin-top:0"' + m.group(2)

    s, n = HEADING_DIV.subn(add_style, s)
    if n == 0:
        return s, "no heading widgets found"
    return s, f"{n} heading(s) normalised"

def main():
    files = sorted(f for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
                   if "wp-content" not in f and "wp-includes" not in f and "_probe" not in f)
    changed = 0
    for f in files:
        s = open(f, encoding="utf-8", errors="strict").read()
        out, status = transform(s)
        rel = os.path.relpath(f, ROOT)
        if out != s:
            open(f, "w", encoding="utf-8", newline="").write(out)
            changed += 1
            print(f"  OK      {rel}  ({status})")
        else:
            print(f"  skipped {rel}  ({status})")
    print(f"\nfiles changed: {changed}")

if __name__ == "__main__":
    main()
