#!/usr/bin/env python3
"""Bakes the header and footer (currently written by js/components.js at runtime) as static
HTML directly into every page, so crawlers that do not run JavaScript still see them.
Mirrors the exact markup/logic in js/components.js. Run once; components.js itself now has a
guard so it skips re-inserting header/footer where this script already baked them in.

  python3 tools/bake_header_footer.py

Edits files in white-physio/ in place.
"""
import re, os, datetime

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'white-physio')

SITE = {
    'name': 'White Physiotherapy Clinic',
    'whatsappNumber': '2349029839464',
    'whatsappDisplay': '+234 902 983 9464',
    'whatsappMessage': 'Hello White Physiotherapy, I would like to make an enquiry.',
    'homeVisitMessage': 'Hello White Physiotherapy, I would like to book a home physiotherapy visit.',
    'phoneTel': '+2349029839464',
    'phoneDisplay': '+234 902 983 9464',
    'email': 'whitephysiotherapy@gmail.com',  # NOTE: the live footer shows a SECOND email too (admin@whitephysiotherapy.com);
    'email2': 'admin@whitephysiotherapy.com',      # this script's render_footer() only has one <li>, so if it's ever used on a
}                                                  # genuinely new page, add the second <li> by hand afterwards.

def wa_url(message):
    from urllib.parse import quote
    return 'https://wa.me/' + SITE['whatsappNumber'] + '?text=' + quote(message)

WHATSAPP_URL = wa_url(SITE['whatsappMessage'])
HOME_VISIT_URL = wa_url(SITE['homeVisitMessage'])

PROGRAMS = [
    ('Sciatic Nerve Care', '/programmes/sciatica-lower-back-pain'),
    ('Piriformis Syndrome', '/programmes/piriformis-syndrome'),
    ('Cervical Spondylosis', '/programmes/cervical-spondylosis'),
    ('Knee Arthritis', '/programmes/knee-arthritis'),
    ('Home Visit Booking', '/home-service'),
    ('FlexRecovery Studio', '/studio'),
]
CONDITIONS = [
    ('Sciatica &amp; Back Pain', '/programmes/sciatica-lower-back-pain'),
    ('Knee Pain &amp; Arthritis', '/programmes/knee-arthritis'),
    ('Neck &amp; Cervical Pain', '/programmes/cervical-spondylosis'),
    ('Stroke Recovery', '/home-service'),
    ('After-Surgery Recovery', '/home-service'),
    ('Elderly Mobility', '/home-service'),
]

def render_list(items):
    lis = ''.join('<li><a href="%s">%s</a></li>' % (href, label) for label, href in items)
    return '<ul class="site-footer__list">%s</ul>' % lis

def render_header(logo_only, cta_text, cta_href):
    skip = '<a class="skip-link" href="#main">Skip to content</a>'
    if logo_only:
        return (
            skip +
            '<header class="site-header site-header--logo">\n'
            '  <div class="container site-header__inner">\n'
            '    <a class="brand" href="/" aria-label="%s, home">\n'
            '      <img src="/assets/logo-clinic.png" width="397" height="170" alt="%s: Rehab, Fitness, Nutrition">\n'
            '    </a>\n'
            '  </div>\n'
            '</header>'
        ) % (SITE['name'], SITE['name'])

    if cta_text and cta_href:
        cta = '<a class="btn btn--primary btn--sm site-header__cta" href="%s">%s</a>' % (cta_href, cta_text)
    elif cta_text:
        cta = '<a class="btn btn--primary btn--sm site-header__cta" data-wa href="%s" target="_blank" rel="noopener">%s</a>' % (HOME_VISIT_URL, cta_text)
    else:
        cta = ''

    return (
        skip +
        '<header class="site-header">\n'
        '  <div class="container site-header__inner">\n'
        '    <a class="brand" href="/" aria-label="%s, home">\n'
        '      <img src="/assets/logo-clinic.png" width="397" height="170" alt="%s: Rehab, Fitness, Nutrition">\n'
        '    </a>\n'
        '    %s\n'
        '    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">\n'
        '      <span></span><span></span><span></span>\n'
        '    </button>\n'
        '    <nav class="nav" id="site-nav" aria-label="Main">\n'
        '      <ul class="nav__list">\n'
        '        <li><a class="nav__link" href="/">Home</a></li>\n'
        '        <li><a class="nav__link" href="/#services">Services</a></li>\n'
        '        <li><a class="nav__link" href="/#conditions">Conditions</a></li>\n'
        '        <li><a class="nav__link" href="/#programs">Programs</a></li>\n'
        '        <li><a class="nav__link" href="/#faq">FAQ</a></li>\n'
        '        <li class="nav__cta">\n'
        '          <a class="btn btn--whatsapp btn--block" href="%s" target="_blank" rel="noopener">\n'
        '            <span class="btn__icon" aria-hidden="true">\U0001F4AC</span> WhatsApp Us\n'
        '          </a>\n'
        '        </li>\n'
        '      </ul>\n'
        '    </nav>\n'
        '  </div>\n'
        '</header>'
    ) % (SITE['name'], SITE['name'], cta, WHATSAPP_URL)

def render_wa_float(message):
    url = wa_url(message)
    return (
        '<a class="wa-float" href="%s" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">\n'
        '  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>\n'
        '</a>'
    ) % url

def render_footer(wa_message):
    year = datetime.datetime.now().year
    return (
        '<footer class="site-footer">\n'
        '  <div class="container">\n'
        '    <div class="site-footer__grid">\n'
        '      <div class="site-footer__brand">\n'
        '        <a class="site-footer__logo" href="/" aria-label="%(name)s, home">\n'
        '          <img src="/assets/logo-clinic-light.png" width="398" height="170" alt="%(name)s" loading="lazy">\n'
        '        </a>\n'
        '        <p class="site-footer__blurb" data-placeholder>Physiotherapy at your home and on your phone, across Nigeria. Choose a home visit, a 30-day exercise programme or a visit to our studio.</p>\n'
        '        <ul class="site-footer__contact">\n'
        '          <li><span aria-hidden="true">\U0001F4DE</span><a href="tel:%(phoneTel)s">%(phoneDisplay)s</a></li>\n'
        '          <li data-placeholder><span aria-hidden="true">\u2709\uFE0F</span><a href="mailto:%(email)s">%(email)s</a></li>\n'
        '          <li><span aria-hidden="true">\U0001F4AC</span><span>WhatsApp: <a href="%(waUrl)s" target="_blank" rel="noopener">%(waDisplay)s</a></span></li>\n'
        '        </ul>\n'
        '      </div>\n'
        '      <nav aria-label="Recovery programs">\n'
        '        <h2 class="site-footer__title">Recovery Programs</h2>%(programs)s\n'
        '      </nav>\n'
        '      <nav aria-label="Conditions">\n'
        '        <h2 class="site-footer__title">Conditions</h2>%(conditions)s\n'
        '      </nav>\n'
        '    </div>\n'
        '    <p class="site-footer__disclaimer" data-placeholder>Our programmes are home wellness and exercise plans. They do not replace a doctor\'s diagnosis or treatment.</p>\n'
        '    <div class="site-footer__bar">\n'
        '      <p>\u00A9 %(year)s %(name)s. All rights reserved.</p>\n'
        '      <p>Official WhatsApp: <a href="%(waUrl)s" target="_blank" rel="noopener">%(waDisplay)s</a></p>\n'
        '    </div>\n'
        '  </div>\n'
        '</footer>\n'
        '%(waFloat)s\n'
        '<button class="back-to-top" type="button" aria-label="Back to top" hidden>\n'
        '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>\n'
        '</button>'
    ) % {
        'name': SITE['name'],
        'phoneTel': SITE['phoneTel'],
        'phoneDisplay': SITE['phoneDisplay'],
        'email': SITE['email'],
        'waUrl': WHATSAPP_URL,
        'waDisplay': SITE['whatsappDisplay'],
        'programs': render_list(PROGRAMS),
        'conditions': render_list(CONDITIONS),
        'year': year,
        'waFloat': render_wa_float(wa_message),
    }

BODY_RE = re.compile(r'<body([^>]*)>')

def get_attr(attrs_str, name):
    m = re.search(name + r'="([^"]*)"', attrs_str)
    return m.group(1) if m else None

def has_attr(attrs_str, name):
    return (' ' + name + '="') in (' ' + attrs_str) or (' ' + name + '>') in (' ' + attrs_str + '>') or (' ' + name + ' ') in (' ' + attrs_str + ' ')

def process(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()

    # Guard: if this file was already baked (the header/footer comment markers are already in it),
    # baking it again would insert a SECOND header and footer instead of replacing the first ones,
    # because the header/footer script tags this function looks for are deliberately left in place
    # as a JS fallback. This bit the site for real on 2026-09-25 (index/home-service/studio ended up
    # with two headers and two footers each, one of them a stale duplicate) — do not remove this guard.
    if '<!-- Header: baked static HTML' in content or '<!-- Footer: baked static HTML' in content:
        print('SKIP (already baked):', path)
        return

    m = BODY_RE.search(content)
    if not m:
        print('SKIP (no <body>):', path)
        return
    attrs = m.group(1)
    logo_only = 'data-header-logo-only' in attrs
    cta_text = get_attr(attrs, 'data-header-cta')
    cta_href = get_attr(attrs, 'data-header-cta-href')
    wa_message = get_attr(attrs, 'data-wa-message') or SITE['whatsappMessage']

    header_html = render_header(logo_only, cta_text, cta_href)
    footer_html = render_footer(wa_message)

    header_script = '<script src="/js/components.js"></script>'
    footer_script = '<script src="/js/components.js" data-part="footer"></script>'

    if header_script not in content:
        print('SKIP (header script not found, already baked?):', path)
        return
    if footer_script not in content:
        print('SKIP (footer script not found, already baked?):', path)
        return

    content = content.replace(
        header_script,
        '<!-- Header: baked static HTML (was written by js/components.js at runtime; kept there as a JS fallback). -->\n  '
        + header_html + '\n  ' + header_script,
        1
    )
    content = content.replace(
        footer_script,
        '<!-- Footer: baked static HTML (was written by js/components.js at runtime; kept there as a JS fallback). -->\n  '
        + footer_html + '\n  ' + footer_script,
        1
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('baked:', path, '(logo_only=%s, cta=%r/%r, wa_message=%r)' % (logo_only, cta_text, cta_href, wa_message[:40]))

def main():
    # No payment.html anymore (TeleRehab/home-visit bookings go to the external EHR booking page instead).
    pages = ['index.html', 'home-service.html', 'studio.html', '404.html', 'privacy.html']
    for p in pages:
        process(os.path.join(ROOT, p))
    prog_dir = os.path.join(ROOT, 'programmes')
    for fn in sorted(os.listdir(prog_dir)):
        if fn.endswith('.html'):
            process(os.path.join(prog_dir, fn))

if __name__ == '__main__':
    main()
