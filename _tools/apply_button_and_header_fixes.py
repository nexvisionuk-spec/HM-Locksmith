# -*- coding: utf-8 -*-
"""
1) Link /assets/css/hm-overrides.css last on every page.
2) Replace the theme's orange accent (#E0592E / #D75127) with the brand red
   (#C41230 / #A00F24) in CSS and HTML.
3) Fix the header logo link (was href="#").
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINK = '<link rel="stylesheet" href="/assets/css/hm-overrides.css">'

COLOURS = [
    ("#E0592E", "#C41230"), ("#e0592e", "#c41230"),
    ("#D75127", "#A00F24"), ("#d75127", "#a00f24"),
    ("224,89,46", "196,18,48"),
    ("224, 89, 46", "196, 18, 48"),
]

def main():
    targets = []
    for pat in ("*.html", "*/index.html", "*/*/index.html"):
        targets.extend(glob.glob(os.path.join(ROOT, pat)))
    targets = sorted(set(f for f in targets
                         if "wp-content" not in f and "wp-includes" not in f
                         and "_probe" not in os.path.basename(f)))
    targets += sorted(glob.glob(os.path.join(ROOT, "wp-content", "**", "*.css"), recursive=True))

    linked = colours = logo = 0
    for f in targets:
        s = open(f, encoding="utf-8", errors="strict").read()
        orig = s

        if f.endswith(".html"):
            if "hm-overrides.css" not in s and "</head>" in s:
                s = s.replace("</head>", f"  {LINK}\n</head>", 1)
                linked += 1
            # header logo anchor: href="#" -> "/"
            s, n = re.subn(r'(<a href=")#("[^>]*class="sc_layouts_logo)', r'\g<1>/\g<2>', s)
            logo += n

        for a, b in COLOURS:
            if a in s:
                colours += s.count(a)
                s = s.replace(a, b)

        if s != orig:
            open(f, "w", encoding="utf-8", newline="").write(s)

    print(f"pages linked to overrides css : {linked}")
    print(f"colour occurrences replaced   : {colours}")
    print(f"logo links fixed              : {logo}")

    # report any orange left
    print("\nremaining orange refs:")
    left = 0
    for f in targets:
        s = open(f, encoding="utf-8", errors="replace").read()
        for m in re.finditer(r'(E0592E|e0592e|D75127|d75127|224,\s?89,\s?46)', s, re.I):
            print("  ", os.path.relpath(f, ROOT), m.group(0))
            left += 1
            if left > 15: break
        if left > 15: break
    if not left:
        print("   none")

if __name__ == "__main__":
    main()
