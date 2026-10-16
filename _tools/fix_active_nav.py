# -*- coding: utf-8 -*-
"""On each new service page, move the nav 'active/current page' state from
Locksmith to that page's own menu item."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = {
    "home-security":      "/trades/home-security/",
    "cctv-entry":         "/trades/cctv-entry/",
    "painting":           "/trades/painting/",
    "refurbishment":      "/trades/refurbishment/",
    "building-services":  "/trades/building-services/",
    "insurance-service":  "/trades/insurance-service/",
    "technical-services": "/trades/technical-services/",
}

OLD_ACTIVE = ('class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item '
              'page_item page-item-8340 current_page_item trx-addons-nav-menu-item '
              'trx-addons-submenu-item trx-addons-active-item"><a href="/trades/locksmith/" aria-current="page"')
NEW_INACTIVE = ('class="menu-item menu-item-type-post_type menu-item-object-page '
                'trx-addons-nav-menu-item trx-addons-submenu-item"><a href="/trades/locksmith/"')

for key, path in PAGES.items():
    f = os.path.join(ROOT, "trades", key, "index.html")
    s = open(f, encoding="utf-8", errors="strict").read()

    # 1) deactivate the Locksmith nav item
    s, n_off = re.subn(re.escape(OLD_ACTIVE), NEW_INACTIVE, s)

    # 2) activate this page's own nav item
    pat = re.compile(
        r'class="menu-item menu-item-type-custom menu-item-object-custom '
        r'trx-addons-nav-menu-item trx-addons-submenu-item"><a href="'
        + re.escape(path) +
        r'" class="trx-addons-menu-link trx-addons-submenu-link"')
    s, n_on = pat.subn(
        'class="menu-item menu-item-type-custom menu-item-object-custom current-menu-item '
        'trx-addons-nav-menu-item trx-addons-submenu-item trx-addons-active-item"><a href="'
        + path + '" aria-current="page" class="trx-addons-menu-link trx-addons-submenu-link"', s)

    open(f, "w", encoding="utf-8", newline="").write(s)
    print(f"{key:20} deactivated={n_off}  activated={n_on}")

print("\nverify:")
for key, path in PAGES.items():
    f = os.path.join(ROOT, "trades", key, "index.html")
    s = open(f, encoding="utf-8", errors="replace").read()
    print(f"  {key:20} locksmith-active={s.count(OLD_ACTIVE)}  own-active={s.count('aria-current=\"page\"')}")
