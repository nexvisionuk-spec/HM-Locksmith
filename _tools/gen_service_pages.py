# -*- coding: utf-8 -*-
"""
Generate service pages for H&M site by cloning the working Locksmith trade page
and swapping ONLY the text blocks (design untouched).

Source text is taken from the original site (hmlocksmithandbuildingservices.co.uk).
Run from repo root:  python _tools/gen_service_pages.py
"""
import re, os, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "trades", "locksmith", "index.html")

# --------------------------------------------------------------------------
# PAGE DATA  (label / title / url title / hero h1 / hero p / eyebrow /
#             section h1 / section p / [ (card title, card desc) x N ])
# --------------------------------------------------------------------------
PAGES = {
"home-security": {
  "label": "Home Security",
  "meta_title": "Home Security &#8211; H&amp;M",
  "og_title": "Home Security",
  "hero_h1": "Keeping Your Home Safe &amp; Secure",
  "hero_p": "At H&amp;M Locksmith and Security, we understand the importance of keeping your home safe and secure. Our comprehensive home security solutions are designed to protect your loved ones and your property, giving you peace of mind whether you&#8217;re at home or away.",
  "eyebrow": "HOME SECURITY SOLUTIONS FOR HOMES &amp; BUSINESSES",
  "sec_h1": "Protecting Your Home, Day &amp; Night",
  "sec_p": "From CCTV and alarms to digital locks and security lighting, we design and install systems that keep your home and property protected around the clock.",
  "cards": [
    ("CCTV Systems", "Discover peace of mind with our cutting-edge CCTV systems, offering round-the-clock surveillance for your home. Our advanced cameras provide high-definition recording and remote monitoring capabilities, ensuring you can keep a watchful eye on your property from anywhere, at any time."),
    ("Motion Sensors", "Enhance your home security with our state-of-the-art motion sensors. Designed to detect movement and trigger instant alerts, our sensors offer customizable sensitivity settings to suit your specific needs. Whether it&#8217;s detecting intruders or notifying you of unexpected visitors, our motion sensors provide an added layer of protection."),
    ("Floodlights", "Illuminate your property and deter intruders with our powerful floodlights. Our range includes energy-efficient LED lights with adjustable brightness settings, allowing you to customize your security lighting. With durable construction and reliable performance, our floodlights ensure your safety and peace of mind, day or night."),
    ("Digital Locks", "Upgrade your home security with our digital lock solutions. Say goodbye to traditional keys and enjoy the convenience and peace of mind of keyless entry. Our digital locks offer advanced features such as PIN code access, remote locking, and audit trails, providing secure access control for your home."),
    ("Alarms", "Protect your home with our comprehensive alarm systems. From intruder alarms to smoke and carbon monoxide detectors, our alarms are designed to alert you to potential threats and emergencies. With professional installation and monitoring services available, you can trust us to keep your home and loved ones safe around the clock."),
    ("Burglary Inspection", "Ensure the security of your home with our thorough burglary inspection services. Our expert technicians will assess your property for vulnerabilities and recommend tailored security solutions to fortify your defences against potential intruders. From assessing entry points to evaluating existing security measures, our inspection services provide invaluable insights to enhance your home security strategy."),
  ],
},
"cctv-entry": {
  "label": "CCTV &amp; Entry",
  "meta_title": "CCTV &amp; Entry &#8211; H&amp;M",
  "og_title": "CCTV &amp; Entry",
  "hero_h1": "CCTV, Alarms &amp; Door Entry Systems",
  "hero_p": "Residential and commercial security in London. From high-definition CCTV and intruder alarms to door entry systems and security lighting, we protect your property and give you peace of mind whether you&#8217;re at home or away.",
  "eyebrow": "CCTV, ALARMS &amp; DOOR ENTRY FOR HOMES &amp; BUSINESSES",
  "sec_h1": "Watch Over What Matters, Day &amp; Night",
  "sec_p": "From round-the-clock surveillance to controlled access at the door, our security systems are designed, installed and maintained by our own qualified team.",
  "cards": [
    ("CCTV Systems", "Discover peace of mind with our cutting-edge CCTV systems, offering round-the-clock surveillance for your home. Our advanced cameras provide high-definition recording and remote monitoring capabilities, ensuring you can keep a watchful eye on your property from anywhere, at any time."),
    ("Door Entry Systems", "Control who comes and goes with professionally installed door entry systems, for homes, blocks of flats and commercial premises."),
    ("Alarm Systems", "Protect your home with our comprehensive alarm systems. From intruder alarms to smoke and carbon monoxide detectors, our alarms are designed to alert you to potential threats and emergencies. With professional installation and monitoring services available, you can trust us to keep your home and loved ones safe around the clock."),
    ("Motion Sensors", "Enhance your home security with our state-of-the-art motion sensors. Designed to detect movement and trigger instant alerts, our sensors offer customizable sensitivity settings to suit your specific needs."),
    ("Security Lighting", "Illuminate your property and deter intruders with our powerful floodlights. Our range includes energy-efficient LED lights with adjustable brightness settings, allowing you to customize your security lighting."),
    ("CCTV Investigation &amp; Reports", "CCTV investigation and reporting for commercial premises, planned maintenance contracts and ongoing property management."),
  ],
},
"painting": {
  "label": "Painting &amp; Decorating",
  "meta_title": "Painting &amp; Decorating &#8211; H&amp;M",
  "og_title": "Painting &amp; Decorating",
  "hero_h1": "Keeping Your Home Vibrant",
  "hero_p": "Enhance the beauty and value of your property with H&amp;M Domestic and Building Services&#8217; premier painting solutions. Whether it&#8217;s brightening up your living space or revitalizing the exterior of your building, we have the expertise and skill to transform your vision into reality.",
  "eyebrow": "PROFESSIONAL PAINTERS &amp; DECORATORS IN LONDON",
  "sec_h1": "Painting &amp; Decorating That Transforms Your Property",
  "sec_p": "From interior walls and ceilings to exteriors, commercial spaces and specialist finishes, our painters deliver smooth, even coats and crisp lines.",
  "cards": [
    ("Interior Painting Excellence", "At H&amp;M Domestic and Building Services, we specialize in interior painting that breathes new life into your home or commercial space. Our meticulous painters pay attention to detail, ensuring smooth, even coats and crisp lines. From vibrant accent walls to elegant neutrals, we offer a wide range of colour options to suit your style and preferences."),
    ("Exterior Painting Expertise", "Boost your property&#8217;s curb appeal and protect it from the elements with our professional exterior painting services. Our experienced team prepares surfaces meticulously, addressing any repairs or priming requirements before applying premium-quality paint. With H&amp;M Domestic and Building Services, you can trust that your exterior will look stunning and withstand the test of time."),
    ("Commercial Painting", "Make a lasting impression on clients and customers with our commercial painting solutions. Whether it&#8217;s an office building, retail space, or apartment complex, our skilled painters work efficiently to minimize disruptions to your business operations. We understand the importance of delivering high-quality results on time and within budget."),
    ("Specialty Finishes", "Add personality and flair to your interiors with our specialty finish painting services. From textured walls to decorative accents, our team can bring your unique vision to life. Whether you&#8217;re aiming for a rustic, industrial look or a sophisticated, modern feel, we have the expertise to execute custom finishes that elevate your space."),
    ("Cabinet Refinishing", "Revitalize your kitchen or bathroom with our cabinet refinishing services. Our skilled craftsmen can transform outdated cabinets into stylish focal points with a fresh coat of paint or stain."),
    ("Deck Staining", "We offer deck staining services to protect and enhance the beauty of your outdoor living areas, ensuring they withstand the elements for years to come."),
  ],
},
"refurbishment": {
  "label": "Refurbishment",
  "meta_title": "Refurbishment &#8211; H&amp;M",
  "og_title": "Refurbishment",
  "hero_h1": "Refurbishment Built Around Your Property",
  "hero_p": "At H&amp;M Domestic and Building Services, we&#8217;re dedicated to providing comprehensive building solutions for residential and commercial properties. With our commitment to quality craftsmanship, attention to detail, and customer satisfaction, we strive to exceed expectations in every project we undertake.",
  "eyebrow": "REFURBISHMENT &amp; BUILDING SERVICES IN LONDON",
  "sec_h1": "Keeping Your Home Connected",
  "sec_p": "Transform your existing property into the space you&#8217;ve always envisioned &mdash; from single-room updates to complete refurbishments.",
  "cards": [
    ("Renovations and Remodeling", "Transform your existing property into the space you&#8217;ve always envisioned with our renovation and remodeling services. Whether you&#8217;re updating a kitchen, renovating a bathroom, or expanding your living space, our skilled craftsmen deliver superior workmanship and attention to detail. From design consultation to project management and construction, we work closely with you to ensure your renovation project meets your needs, budget, and timeline."),
    ("Additions and Extensions", "Need more space but don&#8217;t want to move? Our team specializes in building additions and extensions that seamlessly integrate with your existing structure. Whether you&#8217;re adding a new room, expanding a kitchen, or building a garage, we&#8217;ll work closely with you to design and build an addition that enhances the functionality and value of your property while complementing its architectural style."),
    ("Interior Finishing", "From site preparation and framing to roofing and interior finishing, our comprehensive services ensure a seamless and successful build from start to finish."),
    ("Commercial Construction", "From retail stores and office buildings to restaurants and healthcare facilities, we have the expertise to handle a wide range of commercial construction projects. Our team understands the unique challenges and requirements of commercial construction, and we&#8217;re committed to delivering high-quality results on time and within budget."),
    ("Project Management and Consultation", "Our experienced project managers provide expert consultation, planning, and coordination to ensure your project runs smoothly from concept to completion. Whether you need assistance with design, budgeting, scheduling, or permitting, we&#8217;re here to help you navigate the complexities of building construction with confidence and peace of mind."),
    ("Green Building Solutions", "Reduce your environmental footprint and lower your operating costs with our green building solutions. From energy-efficient design and construction techniques to sustainable materials and renewable energy systems, we offer eco-friendly building options that prioritize environmental responsibility without compromising on quality or comfort."),
  ],
},
"building-services": {
  "label": "Building Services",
  "meta_title": "Building Services &#8211; H&amp;M",
  "og_title": "Building Services",
  "hero_h1": "Comprehensive Building Solutions",
  "hero_p": "At H&amp;M Domestic and Building Services, we&#8217;re dedicated to providing comprehensive building solutions for residential and commercial properties. With our commitment to quality craftsmanship, attention to detail, and customer satisfaction, we strive to exceed expectations in every project we undertake.",
  "eyebrow": "BUILDING SERVICES FOR HOMES &amp; BUSINESSES IN LONDON",
  "sec_h1": "Keeping Your Home Connected",
  "sec_p": "From new construction and extensions to commercial projects and planned maintenance, our builders handle every aspect of the construction process.",
  "cards": [
    ("New Construction", "From concept to completion, our experienced team of builders can bring your vision to life with new construction projects. Whether you&#8217;re building your dream home, a commercial space, or an industrial facility, we have the expertise and resources to handle every aspect of the construction process. Our comprehensive services include site preparation, foundation work, framing, roofing, and interior finishing, ensuring a seamless and successful build from start to finish."),
    ("Renovations and Remodeling", "Transform your existing property into the space you&#8217;ve always envisioned with our renovation and remodeling services. Whether you&#8217;re updating a kitchen, renovating a bathroom, or expanding your living space, our skilled craftsmen deliver superior workmanship and attention to detail."),
    ("Additions and Extensions", "Need more space but don&#8217;t want to move? Our team specializes in building additions and extensions that seamlessly integrate with your existing structure, enhancing the functionality and value of your property while complementing its architectural style."),
    ("Commercial Construction", "From retail stores and office buildings to restaurants and healthcare facilities, we have the expertise to handle a wide range of commercial construction projects. Whether you&#8217;re starting from the ground up or renovating an existing space, you can trust H&amp;M Domestic and Building Services to deliver exceptional craftsmanship and professionalism."),
    ("Project Management and Consultation", "At H&amp;M Domestic and Building Services, we understand that every project is unique, and we&#8217;re here to guide you through every step of the building process. Our experienced project managers provide expert consultation, planning, and coordination to ensure your project runs smoothly from concept to completion."),
    ("Green Building Solutions", "Reduce your environmental footprint and lower your operating costs with our green building solutions. From energy-efficient design and construction techniques to sustainable materials and renewable energy systems, we offer eco-friendly building options that prioritize environmental responsibility without compromising on quality or comfort."),
  ],
},
"insurance-service": {
  "label": "Insurance Service",
  "meta_title": "Insurance Service &#8211; H&amp;M",
  "og_title": "Insurance Service",
  "hero_h1": "Guaranteed Work You Can Rely On",
  "hero_p": "H&amp;M Locksmith and Building Services LTD provide a 12-month guarantee on labour carried out by our team, in respect of faulty workmanship only. This is active from the date of completion of work, in addition to any manufacturer&#8217;s warranty.",
  "eyebrow": "12-MONTH GUARANTEE &amp; MANUFACTURER WARRANTIES",
  "sec_h1": "Protected Workmanship, Guaranteed",
  "sec_p": "Our tradesmen are DBS-checked, qualified and trusted to complete the job to a high standard &mdash; and our workmanship is backed in writing.",
  "cards": [
    ("12-Month Guarantee", "We provide a 12-month guarantee on labour carried out by H&amp;M Locksmith and Building Services LTD, in respect of faulty workmanship only. This is active from the date of completion of work, in addition to any manufacturer&#8217;s warranty or warranties."),
    ("Manufacturer Warranties", "Our guarantee runs alongside any manufacturer&#8217;s warranty on parts and appliances supplied, giving you protection on both the workmanship and the materials."),
    ("Qualified &amp; DBS Checked", "Our engineers are always on stand-by for your emergency. They are DBS-checked, qualified and can be trusted to complete the job to a high standard."),
    ("Fully Insured", "Our team is fully insured and our work is backed by recognised accreditations, so you can have confidence in every job we carry out."),
    ("Satisfaction &amp; Remedial Work", "If you are not completely happy with our service after we have completed the work, you must notify us in writing within 12 months. You must give us and our insurers the chance to assess and, if necessary, perform remedial work."),
    ("Planned Maintenance Contracts", "H&amp;M Locksmith and Building Services LTD offer planned service and maintenance plans for your property. This guarantees that regular maintenance and repair work is carried out to prevent the breakdown of critical equipment."),
  ],
},
"technical-services": {
  "label": "Technical Services",
  "meta_title": "Technical Services &#8211; H&amp;M",
  "og_title": "Technical Services",
  "hero_h1": "Technical Services &amp; Planned Maintenance",
  "hero_p": "H&amp;M Locksmith and Building Services LTD offer planned service and maintenance plans for your commercial property. This guarantees that regular maintenance and repair work is carried out to prevent the breakdown of critical equipment, ensuring that your organisation runs as efficiently as possible.",
  "eyebrow": "PLANNED MAINTENANCE &amp; TECHNICAL SERVICES IN LONDON",
  "sec_h1": "Keeping Your Systems Running Smoothly",
  "sec_p": "We are highly experienced in commercial and real estate work, with all tradesmen expected to leave the workspace clean and cause minimum disruption.",
  "cards": [
    ("Planned Maintenance Service", "For a planned maintenance service please contact us. In this phone call, we will arrange for an experienced engineer to do a thorough assessment of your property. When this is done a schedule will be made to comply with the services your property requires."),
    ("Heating &amp; Boiler Servicing", "Central heating servicing, boiler servicing, gas appliance servicing and gas safety checks, carried out by our qualified engineers."),
    ("Portable Appliance Testing (PAT)", "Portable appliance testing (PAT) for commercial premises, helping you stay compliant and keep your equipment safe."),
    ("Electrical Inspections &amp; Reports", "Electrical periodic inspections and reports, including EICR certification for landlords and commercial properties."),
    ("CCTV Investigation &amp; Reports", "CCTV investigation and reporting, plus door entry systems, security lighting and access control for commercial sites."),
    ("Emergency 24-Hour Service", "Our professional tradesmen are available 24 hours a day, 7 days a week, 365 days a year. No matter your need, from a boiler service to a full property renovation, we can provide a tailored service to your needs."),
  ],
},
}

# --------------------------------------------------------------------------
def build(page_key, data, tpl):
    s = tpl

    # 1. <title>
    s2 = re.sub(r'<title>.*?</title>', f'<title>{data["meta_title"]}</title>', s, count=1, flags=re.S)
    assert s2 != s, "title not replaced"; s = s2

    # 2. og:url / og:title
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(")',
               lambda m: m.group(1) + f'/trades/{page_key}/' + m.group(2), s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*(")',
               lambda m: m.group(1) + data["og_title"] + m.group(2), s, count=1)

    # 3. og:description  -> hero h1 + hero p
    s = re.sub(r'(<meta property="og:description" content=")[^"]*(")',
               lambda m: m.group(1) + data["hero_h1"] + " " + data["hero_p"].replace('"', '&quot;') + m.group(2),
               s, count=1)

    # 4. hero <h1>  (also appears inside JSON-LD/og — replace only the visible h1 tag)
    s = re.sub(r'(<h1 class="elementor-heading-title elementor-size-default">)Fast, Reliable Locksmith Services When You Need Them(</h1>)',
               lambda m: m.group(1) + data["hero_h1"] + m.group(2), s, count=1)

    # 5. hero paragraph (the widget flagged data-is-only-node)
    def hero_p_sub(m):
        return m.group(1) + data["hero_p"] + m.group(2)
    s, n = re.subn(r'(data-is-only-node="">).*?(</p>)', hero_p_sub, s, count=1, flags=re.S)
    assert n == 1, f"{page_key}: hero p not replaced"

    # 6. eyebrow h6
    s = re.sub(r'(<h6 class="elementor-heading-title elementor-size-default">)PROFESSIONAL LOCKSMITH SERVICES FOR HOMES &amp; BUSINESSES(</h6>)',
               lambda m: m.group(1) + data["eyebrow"] + m.group(2), s, count=1)

    # 7. section h1
    s = re.sub(r'(<h1 class="elementor-heading-title elementor-size-default">)Protecting What Matters, Day &amp; Night(</h1>)',
               lambda m: m.group(1) + data["sec_h1"] + m.group(2), s, count=1)

    # 8. section intro p
    s = re.sub(r'(<p data-start="1811" data-end="2126">).*?(</p>)',
               lambda m: m.group(1) + data["sec_p"] + m.group(2), s, count=1, flags=re.S)

    # 9. the six service cards: label + h3 + description  (positional, deterministic)
    LABEL = '<p class="elementor-heading-title elementor-size-default">Locksmith Services</p>'
    labels = [m for m in re.finditer(re.escape(LABEL), s)]
    assert len(labels) == 6, f"{page_key}: expected 6 card labels, found {len(labels)}"

    # rebuild the document by processing each card region from the end backwards
    for i in range(len(labels) - 1, -1, -1):
        start = labels[i].start()
        end = labels[i + 1].start() if i + 1 < len(labels) else start + 12000
        seg = s[start:end]
        title, desc = data["cards"][i]

        new_seg = seg.replace(LABEL, f'<p class="elementor-heading-title elementor-size-default">{data["label"]}</p>', 1)

        m = re.search(r'<h3 class="elementor-heading-title elementor-size-default">.*?</h3>', new_seg, re.S)
        assert m, f"{page_key}: card {i} h3 not found"
        title_end = m.end()
        new_seg = new_seg[:m.start()] + f'<h3 class="elementor-heading-title elementor-size-default">{title}</h3>' + new_seg[title_end:]

        # first <p ...> AFTER the h3 is the description (may carry attributes)
        m = re.search(r'<p\b[^>]*>.*?</p>', new_seg[title_end:], re.S)
        assert m, f"{page_key}: card {i} description not found"
        a, b = title_end + m.start(), title_end + m.end()
        new_seg = new_seg[:a] + f'<p>{desc}</p>' + new_seg[b:]

        s = s[:start] + new_seg + s[end:]

    # 10. JSON-LD post title
    s = s.replace("Locksmith%20%E2%80%93%20H%26M",
                  data["meta_title"].replace(" ", "%20").replace("&#8211;", "%E2%80%93").replace("&amp;", "%26"))

    return s

def main():
    tpl = open(TPL, encoding="utf-8", errors="strict").read()
    written = []
    for key, data in PAGES.items():
        out_dir = os.path.join(ROOT, "trades", key)
        os.makedirs(out_dir, exist_ok=True)
        out = build(key, data, tpl)
        # sanity: no leftover locksmith hero text
        assert "Fast, Reliable Locksmith Services" not in out, f"{key}: hero h1 leftover"
        assert "Emergency Lockouts" not in out, f"{key}: old card leftover"
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8", newline="") as f:
            f.write(out)
        written.append(f"/trades/{key}/")
    print("WROTE:")
    for w in written:
        print("  ", w)

if __name__ == "__main__":
    main()
