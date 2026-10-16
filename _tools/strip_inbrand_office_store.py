"""Strip the in-brand Office + Store widgets from the brand column.
The data-id divs are nested inside parent divs on the same line, so a
simpler regex (no leading newline) matches each self-contained widget."""
import re, pathlib
ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")
TARGET_IDS = ("846af1f", "a431e9c", "7e7a0ea", "a7acabf")
# Match the widget <div>...</div> directly (no \n anchor needed).
STRIP_RE = re.compile(
    r'<div[^>]*data-id="(' + "|".join(TARGET_IDS) + r')"[^>]*>.*?</div>',
    re.DOTALL,
)
updated = 0
for path in sorted(ROOT.rglob("*.html")):
    if "_tools" in path.parts or ".git" in path.parts:
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    new_text, n = STRIP_RE.subn("", text, count=4)
    if n == 0:
        continue
    if n != 4:
        print(f"  WARN stripped {n}/4 in {path.relative_to(ROOT)}")
    path.write_text(new_text, encoding="utf-8")
    updated += 1
    print(f"  stripped  {path.relative_to(ROOT)}")
print(f"\n{updated} file(s) updated")
