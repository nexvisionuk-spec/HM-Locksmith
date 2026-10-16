# -*- coding: utf-8 -*-
"""
1) Build /trades/index.html  — an overview page listing all services
   (uses the site's own header + footer, so it matches the design exactly).
2) Point every footer "Links" item at a real page:
      Home        -> /
      Services    -> /#services
      About Us    -> /about-us/
      Trades      -> /trades/
      Contact Us  -> /contact-us/
      Terms       -> /terms-conditions/  (already linked; left alone)
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL  = os.path.join(ROOT, "trades", "locksmith", "index.html")

TRADES = [
    ("/trades/locksmith/",                            "Locksmith &amp; Security"),
    ("/trades/home-security/",                        "Home Security"),
    ("/trades/cctv-entry/",                           "CCTV &amp; Entry"),
    ("/trades/gas-heating/",                          "Gas &amp; Heating"),
    ("/trades/plumbing/",                             "Plumbing"),
    ("/trades/electrical-mechanical-services-in-uk/", "Electrical &amp; Mechanical"),
    ("/trades/building-services/",                    "Building Services"),
    ("/trades/refurbishment/",                        "Refurbishment"),
    ("/trades/painting/",                             "Painting &amp; Decorating"),
    ("/trades/insurance-service/",                    "Insurance Service"),
    ("/trades/technical-services/",                   "Technical Services"),
]

FOOTER_LINKS = {
    "Home":          "/",
    "Services":      "/#services",
    "About Us":      "/about-us/",
    "Trades":        "/trades/",
    "Contact Us":    "/contact-us/",
}

# ---------------------------------------------------------------- build page
def build_trades_page():
    s = open(TPL, encoding="utf-8", errors="strict").read()

    s = re.sub(r'<title>.*?</title>', '<title>Trades &amp; Services &#8211; H&amp;M</title>', s, count=1, flags=re.S)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(")',
               lambda m: m.group(1) + "/trades/" + m.group(2), s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*(")',
               lambda m: m.group(1) + "Trades &amp; Services" + m.group(2), s, count=1)

    cards = "\n".join(
        f'        <a class="trade-card" href="{href}"><span>{name}</span>'
        f'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>'
        for href, name in TRADES)

    content = f'''
<style>
  .trades-overview {{ padding: 84px 0 96px; }}
  .trades-overview h6 {{ color: #c0392b; letter-spacing: .09em; margin-bottom: 14px; }}
  .trades-overview h1 {{ margin-bottom: 18px; }}
  .trades-overview .lead {{ max-width: 720px; font-size: 1.08rem; }}
  .trade-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; margin-top: 42px; }}
  .trade-card {{ display: flex; align-items: center; justify-content: space-between; gap: 12px;
                 padding: 18px 22px; border: 1px solid rgba(0,0,0,.12); border-radius: 10px;
                 background: #fff; font-weight: 600; text-decoration: none;
                 transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }}
  .trade-card:hover {{ border-color: #c0392b; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.07); }}
  .trade-card svg {{ flex: none; opacity: .45; }}
</style>

<section class="trades-overview">
  <div class="elementor-container" style="max-width:1200px;margin:0 auto;padding:0 20px">
    <h6 class="elementor-heading-title elementor-size-default">OUR TRADES &amp; SERVICES</h6>
    <h1 class="elementor-heading-title elementor-size-default">Every trade you need, under one trusted team</h1>
    <p class="lead">From emergency locksmiths and security systems to plumbing, electrical, painting and full
    building refurbishments &mdash; one trusted company for your home or business, across London.</p>

    <div class="trade-grid">
{cards}
    </div>

    <p style="margin-top:40px">Not sure which service you need? Call us 24/7 on
    <a href="tel:02031051145">0203 105 1145</a> or
    <a href="/contact-us/">send us a message</a> and we&#8217;ll point you to the right team.</p>
  </div>
</section>
'''

    hdr_end = s.index("</header>") + len("</header>")
    ftr     = s.index("<footer")
    out = s[:hdr_end] + content + s[ftr:]

    assert "trade-card" in out and out.count("<footer") == 1
    d = os.path.join(ROOT, "trades")
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "index.html"), "w", encoding="utf-8", newline="") as f:
        f.write(out)
    return f"/trades/index.html  ({len(out):,} bytes)"


# ------------------------------------------------------------- footer links
LI = re.compile(
    r'<li class="elementor-icon-list-item">(\s*)<span class="elementor-icon-list-text">'
    r'([^<]+)</span>(\s*)</li>')

def fix_footer_links(s):
    hits = []

    def sub(m):
        gap1, label, gap2 = m.group(1), m.group(2), m.group(3)
        path = FOOTER_LINKS.get(label.strip())
        if not path:
            return m.group(0)
        hits.append(label.strip())
        return (f'<li class="elementor-icon-list-item">{gap1}'
                f'<a href="{path}">{gap1}<span class="elementor-icon-list-text">{label}</span>{gap1}'
                f'</a>{gap2}</li>')

    s2 = LI.sub(sub, s)
    return s2, hits


def add_services_anchor(s):
    """Give the homepage 'Our Core Services' section an id so /#services works."""
    if 'id="services"' in s:
        return s, False
    needle = 'class="elementor-element elementor-element-ed08da9 e-grid e-con-boxed sc_layouts_column_icons_position_left e-con e-parent" data-id="ed08da9"'
    if needle not in s:
        return s, False
    s = s.replace(needle, needle.replace('class="', 'id="services" class="', 1), 1)
    return s, True


def main():
    print("built:", build_trades_page())

    files = sorted(f for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
                   if "wp-content" not in f and "wp-includes" not in f)
    print("\nfooter links:")
    for f in files:
        s = open(f, encoding="utf-8", errors="strict").read()
        out, hits = fix_footer_links(s)
        rel = os.path.relpath(f, ROOT)
        if out != s:
            open(f, "w", encoding="utf-8", newline="").write(out)
            print(f"  {len(hits)} linked  {rel}  -> {sorted(set(hits))}")

    # homepage anchor for "Services" -> /#services
    home = os.path.join(ROOT, "index.html")
    s = open(home, encoding="utf-8", errors="strict").read()
    s, added = add_services_anchor(s)
    if added:
        open(home, "w", encoding="utf-8", newline="").write(s)
    print(f"\n#services anchor added on homepage: {added}")
    print("\ndone.")

if __name__ == "__main__":
    main()
