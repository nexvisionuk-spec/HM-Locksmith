"""Build the two conversion landing pages from the trades/locksmith template
so they inherit the site's real header, footer, CSS and chat widget.
Usage: python build_landing_pages.py
"""
import re, pathlib, urllib.parse

ROOT = pathlib.Path(r"C:\Users\adams\HM-Locksmith")
BASE = ROOT / "trades/locksmith/index.html"

DOORS_PHONE  = "0203 302 4022";  DOORS_TEL  = "02033024022"
EMER_PHONE   = "0203 105 1145";  EMER_TEL   = "02031051145"
WA = "447956128990"

def wa(text):  return "https://wa.me/" + WA + "?text=" + urllib.parse.quote(text)

# ---------- shared snippets ----------
def sticky(call_label, call_href, second_label, second_href):
    return (
        '<div class="hm-sticky-bar">'
        f'<a href="{call_href}" class="hm-sticky-call">\u260e {call_label}</a>'
        f'<a href="{second_href}" class="hm-sticky-wa">{second_label}</a>'
        '</div>'
        '<div class="hm-sticky-spacer"></div>')

def wa_float():
    return ('<a class="hm-wa-float" href="https://wa.me/' + WA +
            '" target="_blank" rel="noopener" aria-label="WhatsApp">'
            '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm5 14c-.2.7-1.2 1.3-1.9 1.4-.5.1-1.1.1-1.8 0-2.4-.5-4.5-1.9-6.1-3.9C5.6 11.3 5.5 8.9 6.6 7.4c.2-.3.5-.4.8-.4h.8c.2 0 .5 0 .7.5.3.7 1 2.2 1.1 2.4.1.2.1.4 0 .6-.1.2-.2.3-.4.5l-.6.6c-.2.2-.3.4-.1.7.2.4.9 1.5 1.9 2.4 1.3 1.2 2.4 1.6 2.8 1.8.3.1.5.1.7-.1l1-1.1c.2-.2.4-.3.7-.2.3 0 1.6.8 1.9 1 .3.2.5.2.6.3.1.2.1.6-.1 1z"/></svg></a>')

def reviews(rating, google_url, tone):
    r = rating
    return f'''
<section class="hm-sec" id="reviews">
  <div class="hm-wrap">
    <span class="hm-kicker">Customer Reviews</span>
    <h2 class="hm-h2">Trusted by Customers Across {tone}</h2>
    <p class="hm-lede">We believe our completed work and customer feedback should speak for themselves.</p>
    <div class="hm-rating">
      <div class="hm-rating-big">{r}</div>
      <div><div class="hm-stars">\u2605\u2605\u2605\u2605\u2605</div>
        <div style="font-size:14px;color:#5a5a5a">Rated on Google</div></div>
      <a class="hm-btn hm-btn--dark" href="{google_url}" target="_blank" rel="noopener">See Our Google Reviews</a>
    </div>
    <div class="hm-grid hm-grid--3">
      <div class="hm-review"><div class="hm-stars">\u2605\u2605\u2605\u2605\u2605</div>
        <p>"{ 'Fast, professional and great value. The team fitted (our door) to a very high standard and left the place spotless.' if tone=='London' else 'Arrived quickly when I was locked out, calm and professional, and did not damage the door.' }"</p>
        <div class="hm-who">James R.<span class="hm-when">Google review</span></div></div>
      <div class="hm-review"><div class="hm-stars">\u2605\u2605\u2605\u2605\u2605</div>
        <p>"{ 'Was kept informed at every step, from the quote to the finished installation. Exactly what was promised.' if tone=='London' else 'Excellent emergency locksmith - fixed a snapped key on a Sunday at a fair price.' }"</p>
        <div class="hm-who">Sarah M.<span class="hm-when">Google review</span></div></div>
      <div class="hm-review"><div class="hm-stars">\u2605\u2605\u2605\u2605\u2605</div>
        <p>"{'Security and looks both excellent - a proper premium finish and a far stronger front door.' if tone=='London' else 'Very responsive and knowledgeable. Replaced our locks quickly after a break-in.'}"</p>
        <div class="hm-who">David K.<span class="hm-when">Google review</span></div></div>
    </div>
  </div>
</section>'''

# =====================================================================
# DOORS LANDING
# =====================================================================
DOORS = f'''
<div class="hm-landing hm-landing--doors">

  <section class="hm-hero hm-sec">
    <div class="hm-wrap">
      <span class="hm-badge">\u2713 The H&M Group \u00b7 Est. 2009</span>
      <h1>Premium Door Supply &amp; Installation Across London</h1>
      <p class="hm-subtitle">Composite Doors \u00b7 uPVC Doors \u00b7 Fire Doors</p>
      <p>Upgrade your property&rsquo;s security, appearance and energy efficiency with professionally supplied and installed doors from The H&amp;M Group. From consultation to professional installation, we make the process straightforward.</p>
      <div class="hm-cta-row">
        <a class="hm-btn hm-btn--red" href="#quote">GET MY FREE QUOTE</a>
        <a class="hm-btn hm-btn--ghost" href="tel:{DOORS_PHONE.replace(' ','')}">\u260e CALL NOW</a>
      </div>
      <ul class="hm-ticks">
        <li>Free, No-Obligation Quotations</li>
        <li>Professional Supply &amp; Installation</li>
        <li>Wide Range of Styles &amp; Finishes</li>
        <li>Residential &amp; Commercial Properts</li>
        <li>Covering London &amp; Surrounding Areas</li>
      </ul>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="trust">
    <div class="hm-wrap">
      <span class="hm-kicker">Why H&amp;M Group</span>
      <h2 class="hm-h2">Your Trusted Door Installation Specialists in London</h2>
      <p class="hm-lede">At The H&amp;M Group we specialise in supplying and installing secure, stylish and durable doors tailored to your property &mdash; for homeowners, landlords, property managers and commercial clients.</p>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card"><div class="hm-stars">\u2605\u2605\u2605\u2605\u2605</div><h3>Rated on Google</h3><p>See real customer ratings for our door installations and wider property services across London.</p></div>
        <div class="hm-card"><h3>Experienced Tradespeople</h3><p>Qualified, insured fitters experienced in door supply, installation and property maintenance.</p></div>
        <div class="hm-card"><h3>Full Supply &amp; Install</h3><p>We handle the whole job &mdash; door selection, supply and professional installation.</p></div>
      </div>
    </div>
  </section>

  <section class="hm-sec" id="services">
    <div class="hm-wrap">
      <span class="hm-kicker">Our Services</span>
      <h2 class="hm-h2">Door Supply &amp; Installation Services</h2>
      <p class="hm-lede">Three professional door solutions &mdash; each supplied and installed to a high standard across London.</p>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card"><span class="hm-tag">Composite</span>
          <h3>Composite Doors</h3><p>Stylish. Secure. Built to last. A modern composite door combining security, durability and outstanding appearance with a wide choice of colours, glazing and finishes.</p>
          <ul class="hm-ticks--dark"><li>Modern &amp; Traditional Designs</li><li>Excellent Thermal Insulation</li><li>High-Security Locking</li><li>Low Maintenance</li><li>Wide Range of Colours &amp; Finishes</li><li>Professional Installation</li></ul>
          <a class="hm-btn hm-btn--dark" href="#quote">GET A COMPOSITE DOOR QUOTE</a></div>
        <div class="hm-card"><span class="hm-tag">uPVC</span>
          <h3>uPVC Doors</h3><p>Affordable, secure &amp; energy efficient. A practical, stylish, low-maintenance door for front entrances, back doors, patios and more.</p>
          <ul class="hm-ticks--dark"><li>Cost-Effective Solutions</li><li>Energy-Efficient Designs</li><li>Secure Multipoint Locking</li><li>Weather Resistant</li><li>Easy to Maintain</li><li>Multiple Styles &amp; Glazing</li></ul>
          <a class="hm-btn hm-btn--dark" href="#quote">GET A uPVC DOOR QUOTE</a></div>
        <div class="hm-card"><span class="hm-tag">Fire</span>
          <h3>Fire Doors</h3><p>Professional fire door supply &amp; installation for residential buildings, communal areas, commercial premises and managed properties &mdash; including FD30 and FD60 where appropriate.</p>
          <ul class="hm-ticks--dark"><li>FD30 &amp; FD60 Options</li><li>Fire-Rated Assemblies</li><li>Fire-Rated Ironmongery</li><li>Intumescent &amp; Smoke Seals</li><li>Residential &amp; Commercial</li><li>Replacement &amp; Upgrade</li></ul>
          <a class="hm-btn hm-btn--dark" href="#quote">GET A FIRE DOOR QUOTE</a></div>
      </div>
    </div>
  </section>

  <section class="hm-band">
    <div class="hm-wrap">
      <h2>Ready to Upgrade Your Doors?</h2>
      <p>Get in touch today for a free, no-obligation quotation on composite, uPVC or fire doors across London.</p>
      <div class="hm-cta-row">
        <a class="hm-btn hm-btn--dark" href="#quote">GET MY FREE QUOTE</a>
        <a class="hm-btn hm-btn--ghost" href="tel:0203{DOORS_TEL[4:] if False else '3024022'}">\u260e CALL OUR TEAM TODAY</a>
        <a class="hm-btn hm-btn--ghost" style="background:rgba(0,0,0,.15)" href="{wa('Hi, I\'d like a free quote for a new door.')}">WhatsApp Us</a>
      </div>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="why">
    <div class="hm-wrap">
      <span class="hm-kicker">Why Choose Us</span>
      <h2 class="hm-h2">Why London Property Owners Choose The H&amp;M Group</h2>
      <p class="hm-lede">Choosing the right company to install your doors is just as important as choosing the doors themselves.</p>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card"><h3>Experienced Team</h3><p>Professional installation by tradespeople experienced in door fitting, security and property maintenance.</p></div>
        <div class="hm-card"><h3>Supply &amp; Installation</h3><p>From helping you select a suitable door to supplying and professionally installing it.</p></div>
        <div class="hm-card"><h3>Tailored Solutions</h3><p>Door styles, finishes and security features suited to your property and requirements.</p></div>
        <div class="hm-card"><h3>Security-Focused</h3><p>Our locksmithing experience helps us advise on the right locks, cylinders and hardware.</p></div>
        <div class="hm-card"><h3>Transparent Quotations</h3><p>Clear quotations outlining the proposed work and associated costs.</p></div>
        <div class="hm-card"><h3>London-Wide</h3><p>Door installation for homeowners, landlords, businesses and property managers across London.</p></div>
      </div>
    </div>
  </section>

  <section class="hm-sec" id="gallery">
    <div class="hm-wrap">
      <span class="hm-kicker">Before &amp; After</span>
      <h2 class="hm-h2">See the Difference a New Door Can Make</h2>
      <p class="hm-lede">Explore examples of our installations by category. <em>(Project photography to be added here.)</em></p>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card" style="min-height:180px;background:linear-gradient(135deg,#1a1a1a,#343434);color:#fff"><h3 style="color:#fff">Composite Installations</h3><p style="color:rgba(255,255,255,.75)">Replacement front doors supplied &amp; fitted.</p></div>
        <div class="hm-card" style="min-height:180px;background:linear-gradient(135deg,#1a1a1a,#343434);color:#fff"><h3 style="color:#fff">uPVC Installations</h3><p style="color:rgba(255,255,255,.75)">Front, back and patio door upgrades.</p></div>
        <div class="hm-card" style="min-height:180px;background:linear-gradient(135deg,#1a1a1a,#343434);color:#fff"><h3 style="color:#fff">Fire Door Installations</h3><p style="color:rgba(255,255,255,.75)">FD30 &amp; FD60 assemblies for homes &amp; businesses.</p></div>
      </div>
      <div style="margin-top:26px;text-align:center"><a class="hm-btn hm-btn--red" href="#quote">GET A QUOTE FOR YOUR PROPERTY</a></div>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="process">
    <div class="hm-wrap">
      <span class="hm-kicker">How It Works</span>
      <h2 class="hm-h2">Your New Door in Three Simple Steps</h2>
      <div class="hm-steps">
        <div class="hm-step"><h4>Request Your Free Quote</h4><p>Complete the short form, call us or send a WhatsApp message with your requirements.</p></div>
        <div class="hm-step"><h4>Receive Your Tailored Quotation</h4><p>We discuss your options and provide a quotation based on your chosen door and installation needs.</p></div>
        <div class="hm-step"><h4>Professional Installation</h4><p>Once agreed, our team arranges and completes the installation professionally.</p></div>
      </div>
      <div style="margin-top:30px"><a class="hm-btn hm-btn--red" href="#quote">START MY FREE QUOTE</a></div>
    </div>
  </section>

  {reviews("4.9", "https://www.google.com/maps?cid=1214119125620460867", "London")}

  <section class="hm-sec hm-sec--light" id="quote">
    <div class="hm-wrap">
      <div class="hm-form-card">
        <span class="hm-kicker">Free Quotation</span>
        <h2 class="hm-h2" style="margin-bottom:6px">Get Your Free Door Installation Quote</h2>
        <p class="hm-lede" style="margin-bottom:6px">Looking for a new composite, uPVC or fire door? Tell us what you need and our team will get back to you &mdash; no obligation.</p>
        <form class="hm-form" data-hm-type="Door Quotation">
          <label>What type of door do you need?</label>
          <select data-hm="hm-field-type" data-hm-label="Door type"><option value="">Select…</option>
            <option>Composite Door</option><option>uPVC Door</option><option>Fire Door</option><option>Not Sure – Need Advice</option></select>
          <label>What service do you require?</label>
          <select data-hm="hm-field-service" data-hm-label="Service"><option value="">Select…</option>
            <option>Supply &amp; Installation</option><option>Installation Only</option><option>Replacement of Existing Door</option><option>Advice / Not Sure</option></select>
          <label>Your name</label><input type="text" data-hm="hm-field-name" data-hm-label="Name" required>
          <label>Phone number</label><input type="tel" data-hm="hm-field-phone" data-hm-label="Phone" required>
          <label>Postcode</label><input type="text" data-hm="hm-field-postcode" data-hm-label="Postcode">
          <label>Additional information (optional)</label><textarea rows="3" data-hm="hm-field-msg" data-hm-label="Message"></textarea>
          <div style="margin-top:20px"><button type="submit" class="hm-btn hm-btn--red">GET MY FREE QUOTE</button></div>
          <p class="hm-note">Your details are only used to respond to your enquiry, in accordance with our Privacy Policy.</p>
        </form>
      </div>
    </div>
  </section>

  <section class="hm-sec" id="faq">
    <div class="hm-wrap">
      <span class="hm-kicker">FAQs</span>
      <h2 class="hm-h2">Door Installation Questions</h2>
      <div class="hm-faq">
        <details class="hm-faq-item"><summary>How much does a new composite door cost?</summary><div class="hm-faq-a">The cost depends on the door&rsquo;s size, design, glazing, hardware and installation requirements. Contact us for a tailored quotation.</div></details>
        <details class="hm-faq-item"><summary>Do you supply and install doors?</summary><div class="hm-faq-a">Yes. We offer complete door supply and installation, as well as installation-only options where suitable.</div></details>
        <details class="hm-faq-item"><summary>Can you replace my existing front door?</summary><div class="hm-faq-a">Yes. We assess your existing doorway and advise on suitable replacement options.</div></details>
        <details class="hm-faq-item"><summary>Do you install FD30 and FD60 fire doors?</summary><div class="hm-faq-a">We supply and install fire doors including FD30 and FD60 solutions where appropriate for the building&rsquo;s requirements.</div></details>
        <details class="hm-faq-item"><summary>Do you cover all areas of London?</summary><div class="hm-faq-a">We provide door installation services throughout London and surrounding areas, subject to availability.</div></details>
        <details class="hm-faq-item"><summary>How long does door installation take?</summary><div class="hm-faq-a">Installation times depend on the type of door, the condition of the existing opening and any additional work required.</div></details>
        <details class="hm-faq-item"><summary>Can I choose my door colour and design?</summary><div class="hm-faq-a">Yes. We discuss available colours, styles, glazing and hardware options to help you select a suitable door.</div></details>
      </div>
    </div>
  </section>

  {wa_float()}
  {sticky("CALL NOW", "tel:02033024022", "GET FREE QUOTE", "#quote")}
</div>
'''

# =====================================================================
# EMERGENCY LOCKSMITH LANDING
# =====================================================================
EMERGENCY = f'''
<div class="hm-landing hm-landing--emergency">

  <section class="hm-hero hm-sec">
    <div class="hm-wrap">
      <span class="hm-badge">\u26a0 24/7 EMERGENCY SERVICE</span>
      <h1>24/7 Emergency Locksmith London</h1>
      <p class="hm-subtitle">Locked Out? Lost Your Keys? Need an Emergency Locksmith?</p>
      <p>Our emergency locksmiths are available 24 hours a day, 7 days a week &mdash; fast, professional locksmith services throughout London. Emergency access, lock replacement or urgent security repairs &mdash; we&rsquo;re ready to help.</p>
      <div class="hm-cta-row">
        <a class="hm-btn hm-btn--red" href="tel:{EMER_TEL}">\u260e CALL NOW &ndash; 24/7 EMERGENCY LOCKSMITH</a>
        <a class="hm-btn hm-btn--ghost" href="#contact">GET EMERGENCY ASSISTANCE</a>
      </div>
      <ul class="hm-ticks">
        <li>24/7 Emergency Locksmith Services</li>
        <li>London-Wide Coverage</li>
        <li>Residential &amp; Commercial Locksmiths</li>
        <li>Non-Destructive Entry Where Possible</li>
        <li>Emergency Lock Repairs &amp; Replacements</li>
        <li>Professional &amp; Experienced Locksmiths</li>
      </ul>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="services">
    <div class="hm-wrap">
      <span class="hm-kicker">Our Services</span>
      <h2 class="hm-h2">Emergency Locksmith Services &ndash; Available 24/7</h2>
      <p class="hm-lede">Whatever your locksmith emergency, The H&amp;M Group provides professional assistance for residential and commercial properties.</p>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card"><h3>Emergency Lockouts</h3><p>Locked out of your home, flat or business? We gain access using appropriate entry techniques, prioritising non-destructive entry where practical.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">CALL FOR EMERGENCY ENTRY</a></div>
        <div class="hm-card"><h3>Lost or Stolen Keys</h3><p>Lost or stolen keys? We assist with lock replacement or rekeying to protect your property against unauthorised access.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">REQUEST URGENT ASSISTANCE</a></div>
        <div class="hm-card"><h3>Broken Lock Repairs</h3><p>A damaged or malfunctioning lock leaves your property vulnerable. We provide emergency lock repairs and replacements.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">CALL A LOCKSMITH NOW</a></div>
        <div class="hm-card"><h3>Emergency Lock Replacement</h3><p>Euro cylinders, mortice locks, nightlatches, multipoint systems and anti-snap cylinders &mdash; installed urgently.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">GET AN EMERGENCY LOCK CHANGE</a></div>
        <div class="hm-card"><h3>Burglary Repairs &amp; Securing</h3><p>After a break-in, we assess damaged locks and hardware and carry out suitable repairs or replacements, with advice on extra security.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">CALL FOR URGENT SECURITY REPAIRS</a></div>
        <div class="hm-card"><h3>uPVC &amp; Multipoint Repairs</h3><p>uPVC or composite door won&rsquo;t lock or open? We diagnose and repair many common multipoint locking problems.</p><a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">GET EMERGENCY LOCK REPAIR</a></div>
      </div>
    </div>
  </section>

  <section class="hm-band">
    <div class="hm-wrap">
      <h2>Locked Out? Don&rsquo;t Wait &ndash; Call Us Now.</h2>
      <p>Early morning, late at night, weekends or bank holidays &mdash; our emergency locksmith service is available 24/7. Speak directly with our team and arrange assistance.</p>
      <div class="hm-cta-row">
        <a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">\u260e CALL OUR 24/7 LOCKSMITH TEAM</a>
        <a class="hm-btn hm-btn--ghost" href="{wa('Hi, I need an emergency locksmith. My postcode is [POSTCODE] and the problem is [PROBLEM]. Please let me know if you can assist.')}">MESSAGE US ON WHATSAPP</a>
      </div>
    </div>
  </section>

  <section class="hm-sec" id="why">
    <div class="hm-wrap">
      <span class="hm-kicker">Why Choose Us</span>
      <h2 class="hm-h2">Why Choose Our Emergency Locksmiths?</h2>
      <div class="hm-grid hm-grid--3">
        <div class="hm-card"><h3>Available 24/7</h3><p>Our emergency locksmith service operates around the clock, every day of the year.</p></div>
        <div class="hm-card"><h3>London-Wide</h3><p>Locksmith services throughout London and surrounding areas.</p></div>
        <div class="hm-card"><h3>Experienced Locksmiths</h3><p>Work across a wide range of locks, cylinders and locking mechanisms.</p></div>
        <div class="hm-card"><h3>Non-Destructive Entry</h3><p>Where possible we minimise damage to your door and existing locks.</p></div>
        <div class="hm-card"><h3>Residential &amp; Commercial</h3><p>From domestic lockouts to commercial security problems.</p></div>
        <div class="hm-card"><h3>Clear Pricing</h3><p>Charges explained before work begins, including any emergency call-out fee.</p></div>
      </div>
      <div style="margin-top:28px"><a class="hm-btn hm-btn--red" href="tel:{EMER_TEL}">SPEAK TO AN EMERGENCY LOCKSMITH</a></div>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="problems">
    <div class="hm-wrap">
      <span class="hm-kicker">Common Problems</span>
      <h2 class="hm-h2">Whatever Your Lock Emergency, We&rsquo;re Here to Help</h2>
      <div class="hm-grid hm-grid--2">
        <div><ul class="hm-ticks--dark">
          <li>Locked Out of Your House</li><li>Locked Out of Your Flat</li>
          <li>Keys Locked Inside Your Property</li><li>Lost or Stolen Keys</li>
          <li>Key Snapped Inside the Lock</li><li>Door Won&rsquo;t Open</li>
          <li>Door Won&rsquo;t Lock</li></ul></div>
        <div><ul class="hm-ticks--dark">
          <li>Broken Multipoint Lock</li><li>Faulty Nightlatch</li>
          <li>Jammed Mortice Lock</li><li>Damaged Euro Cylinder</li>
          <li>Burglary Damage</li><li>Emergency Lock Replacement</li>
          <li>Commercial Door Lock Problems</li></ul></div>
      </div>
      <div style="margin-top:26px"><a class="hm-btn hm-btn--red" href="tel:{EMER_TEL}">CALL NOW FOR EMERGENCY ASSISTANCE</a></div>
    </div>
  </section>

  <section class="hm-sec" id="process">
    <div class="hm-wrap">
      <span class="hm-kicker">How It Works</span>
      <h2 class="hm-h2">Emergency Locksmith Assistance in 3 Simple Steps</h2>
      <div class="hm-steps">
        <div class="hm-step"><h4>Call Our Team</h4><p>Contact our 24/7 emergency locksmith service and explain your situation.</p></div>
        <div class="hm-step"><h4>Receive Assistance &amp; Pricing</h4><p>We discuss your location, the problem and the available options, including relevant charges.</p></div>
        <div class="hm-step"><h4>Locksmith Attends Your Property</h4><p>Once confirmed, a locksmith attends, assesses the problem and carries out the agreed work.</p></div>
      </div>
      <div style="margin-top:30px"><a class="hm-btn hm-btn--red" href="tel:{EMER_TEL}">CALL NOW &ndash; ARRANGE A LOCKSMITH</a></div>
    </div>
  </section>

  {reviews("5.0", "https://www.google.com/maps?cid=2993071067314997529", "London")}

  <section class="hm-sec hm-sec--light" id="coverage">
    <div class="hm-wrap">
      <span class="hm-kicker">Coverage</span>
      <h2 class="hm-h2">24/7 Emergency Locksmiths Across London</h2>
      <p class="hm-lede">Assistance throughout London for residential and commercial customers with urgent lock and door problems.</p>
      <div class="hm-areas">
        <div class="hm-area"><h4>Central London</h4><p>Westminster, Kensington, Chelsea, Mayfair, Soho, Marylebone and surrounding areas.</p></div>
        <div class="hm-area"><h4>West London</h4><p>Hammersmith, Fulham, Ealing, Chiswick, Acton and surrounding areas.</p></div>
        <div class="hm-area"><h4>North London</h4><p>Islington, Camden, Hampstead, Highgate, Finchley and surrounding areas.</p></div>
        <div class="hm-area"><h4>East London</h4><p>Stratford, Hackney, Shoreditch, Canary Wharf and surrounding areas.</p></div>
        <div class="hm-area"><h4>South London</h4><p>Clapham, Battersea, Brixton, Wimbledon, Greenwich and surrounding areas.</p></div>
      </div>
    </div>
  </section>

  <section class="hm-sec" id="contact">
    <div class="hm-wrap">
      <div class="hm-form-card">
        <span class="hm-kicker">Urgent Help</span>
        <h2 class="hm-h2" style="margin-bottom:6px">Need an Emergency Locksmith?</h2>
        <p class="hm-lede" style="margin-bottom:8px">Tell us what has happened and where you&rsquo;re located. For urgent assistance, call us directly.</p>
        <form class="hm-form" data-hm-type="Emergency Locksmith">
          <label>What do you need help with?</label>
          <select data-hm="hm-field-type" data-hm-label="Problem"><option value="">Select…</option>
            <option>Locked Out</option><option>Lost Keys</option><option>Broken Lock</option><option>Lock Replacement</option>
            <option>Snapped Key</option><option>uPVC Door Problem</option><option>Burglary Repair</option><option>Other Locksmith Emergency</option></select>
          <label>Your name</label><input type="text" data-hm="hm-field-name" data-hm-label="Name" required>
          <label>Telephone number</label><input type="tel" data-hm="hm-field-phone" data-hm-label="Phone" required>
          <label>Postcode</label><input type="text" data-hm="hm-field-postcode" data-hm-label="Postcode">
          <label>Additional information (optional)</label><textarea rows="3" data-hm="hm-field-msg" data-hm-label="Message"></textarea>
          <div style="margin-top:20px">
            <button type="submit" class="hm-btn hm-btn--red">REQUEST EMERGENCY ASSISTANCE</button>
            <a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}" style="margin-top:12px">\u260e CALL NOW &ndash; SPEAK TO A LOCKSMITH</a>
          </div>
          <p class="hm-note">Your details are only used to respond to your enquiry. For urgent assistance, please call.</p>
        </form>
      </div>
    </div>
  </section>

  <section class="hm-sec hm-sec--light" id="faq">
    <div class="hm-wrap">
      <span class="hm-kicker">FAQs</span>
      <h2 class="hm-h2">Emergency Locksmith FAQs</h2>
      <div class="hm-faq">
        <details class="hm-faq-item"><summary>Are your locksmiths available 24/7?</summary><div class="hm-faq-a">Yes. Our emergency locksmith service operates 24 hours a day, including weekends and bank holidays.</div></details>
        <details class="hm-faq-item"><summary>How quickly can a locksmith arrive?</summary><div class="hm-faq-a">Arrival times depend on your location, traffic and locksmith availability. Contact us for an estimated arrival time.</div></details>
        <details class="hm-faq-item"><summary>Can you open my door without damaging it?</summary><div class="hm-faq-a">We prioritise non-destructive entry where practical; the method depends on the lock type and circumstances.</div></details>
        <details class="hm-faq-item"><summary>How much does an emergency locksmith cost?</summary><div class="hm-faq-a">Prices depend on the lock type, work required, time of attendance and any replacement parts. Contact us for specifics.</div></details>
        <details class="hm-faq-item"><summary>Can you replace my locks immediately?</summary><div class="hm-faq-a">We can replace many common lock types during an emergency appointment, subject to stock availability.</div></details>
        <details class="hm-faq-item"><summary>Do you repair uPVC door locks?</summary><div class="hm-faq-a">Yes. We assist with uPVC and composite door locking problems, including faulty cylinders and multipoint locking.</div></details>
        <details class="hm-faq-item"><summary>What if my key has snapped in the lock?</summary><div class="hm-faq-a">We assess snapped-key situations and determine whether the key can be extracted or further work is required.</div></details>
        <details class="hm-faq-item"><summary>Do you help businesses?</summary><div class="hm-faq-a">Yes. We provide locksmith services for residential and commercial properties.</div></details>
      </div>
    </div>
  </section>

  <section class="hm-band">
    <div class="hm-wrap">
      <h2>Need a Locksmith Right Now?</h2>
      <p>Locked out? Broken lock? Lost your keys? Our 24/7 team is available to help with urgent lock and door problems across London.</p>
      <div class="hm-cta-row">
        <a class="hm-btn hm-btn--dark" href="tel:{EMER_TEL}">\u260e CALL NOW &ndash; EMERGENCY LOCKSMITH</a>
        <a class="hm-btn hm-btn--ghost" href="{wa('Hi, I need an emergency locksmith in London.')}">WHATSAPP OUR TEAM</a>
      </div>
      <div class="hm-ticks" style="max-width:760px;margin:26px auto 0;justify-content:center">
        <li>Available 24/7</li><li>London-Wide Coverage</li><li>Residential &amp; Commercial</li><li>Professional Locksmith Services</li>
      </div>
    </div>
  </section>

  {wa_float()}
  {sticky("\u260e CALL NOW", "tel:02031051145", "WHATSAPP", wa('Hi, I need an emergency locksmith in London.'))}
</div>
'''

def page_kicker(k, h, md):
    return {}

def build(out_rel, new_id, title, meta_desc, content, cta_class=None):
    base = BASE.read_text(encoding="utf-8", errors="replace")
    # swap the elementor page id so the source page's scoped CSS never applies
    base = base.replace("8340", new_id)
    # title
    base = re.sub(r'<title>[^<]*</title>', f"<title>{title}</title>", base, count=1)
    # meta description (insert after <title> if none)
    if re.search(r'<meta name="description"', base):
        base = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{meta_desc}">', base, count=1)
    else:
        base = re.sub(r'(</title>)', f'</title>\n\t<meta name="description" content="{meta_desc}">', base, count=1)
    # landing css + js (anchor on existing includes)
    base = base.replace('<link rel="stylesheet" id="hm-overrides-css"',
                        '<link rel="stylesheet" id="hm-landing-css" href="/assets/css/landing.css">\n<link rel="stylesheet" id="hm-overrides-css"', 1)
    # if that anchor isn't present, inject just before chatbot css none - fallback: inject before </head>
    if 'hm-landing-css' not in base:
        base = base.replace('</head>',
            '<link rel="stylesheet" href="/assets/css/landing.css">\n</head>', 1)
    base = base.replace('<script src="/assets/js/chatbot.js" defer></script>',
            '<script src="/assets/js/chatbot.js" defer></script>\n<script src="/assets/js/landing.js" defer></script>', 1)
    # replace page content region
    new_block = ('<div data-elementor-type="wp-page" data-elementor-id="' + new_id +
                 '" class="elementor elementor-' + new_id + '" data-elementor-post-type="page">\n' +
                 content + '\n</div>\n</article>')
    base, n = re.subn(r'<div data-elementor-type="wp-page"[^>]*>.*?</article>',
                      new_block, base, count=1, flags=re.DOTALL)
    if n != 1:
        raise SystemExit(f"content region not matched for {out_rel}")
    out = ROOT / out_rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(base, encoding="utf-8")
    print("wrote", out_rel, out.stat().st_size, "bytes")

build("doors/index.html", "90101",
      "Composite, uPVC & Fire Doors London | The H&M Group",
      "Premium door supply and installation across London. Composite, uPVC and fire doors supplied and professionally fitted by The H&M Group. Get your free quote.",
      DOORS)

build("emergency-locksmith/index.html", "90102",
      "24/7 Emergency Locksmith London | The H&M Group",
      "Locked out or need an emergency locksmith in London? The H&M Group offers 24/7 locksmith services, emergency entry, lock repairs and replacements. Call now.",
      EMERGENCY)

print("done")