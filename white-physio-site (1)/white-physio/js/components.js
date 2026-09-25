/* Shared components (header and footer). Use it twice on every page:

     <body>
       <script src="/js/components.js"></script>                      header, right after <body>
       <main id="main"> ... </main>
       <script src="/js/components.js" data-part="footer"></script>   footer, right after </main>
       <script src="/js/main.js" defer></script>

   Each script writes its markup in place, so there is no flash and no fetch. */
(function () {
  'use strict';

  /* Site settings: change them here and every page updates */
  var SITE = {
    name: 'White Physiotherapy Clinic',
    whatsappNumber: '2349029839464',        /* digits only, with country code */
    whatsappDisplay: '+234 902 983 9464',
    whatsappMessage: 'Hello White Physiotherapy, I would like to make an enquiry.',
    /* Message for every "Book My Home Visit" style button on /home-service (buttons marked data-wa).
       Change the words here once. When the booking flow is ready, those buttons will open it instead. */
    homeVisitMessage: 'Hello White Physiotherapy, I would like to book a home physiotherapy visit.',
    /* Home-visit prices by location, shown in step 4 of the booking quiz on /home-service (js/booking.js).
       PLACEHOLDER: empty until White sends the prices. Add them like this (naira, numbers only):
         'Lagos': { 'Ikeja': 30000, 'Lekki': 40000, '*': 35000 }
       An area's own price wins; '*' is the price for the rest of that state (also "My area is not listed").
       No price found = the quiz says the team will tell the visitor the price on WhatsApp. Area names must match js/booking.js. */
    /* Home-visit pricing: White gave this as two tiers, not a price per state, so that's how it's modelled.
       tierACities pay the tierA rate; every other state pays tierB. Package totals (8 or 12 sessions) are
       worked out from these per-session rates in js/booking.js — nothing else needs to change if the rate
       changes, just the four numbers below. */
    homeVisitPricing: {
      tierACities: ['Lagos', 'Abuja (FCT)', 'Rivers'],
      tierA: { before: 50000, now: 45000 },   /* Lagos, Abuja, Rivers/Port Harcourt: ₦45,000/session (10% off ₦50,000) */
      tierB: { before: 40000, now: 35000 }    /* every other state: ₦35,000/session (₦5,000 off ₦40,000) */
    },
    /* PLACEHOLDER: the ₦25,000 mobilisation fee and the 70/30 payment split are Therafit's structure, used as a
       stand-in at Praise's request. The per-session rates above are White's real, confirmed numbers — this fee
       and the split are not yet confirmed for White and should be checked before launch (see HANDOFF.md). */
    homeVisitMobilizationFee: 25000,
    /* Messages for the two FlexRecovery Studio buttons on /studio (data-wa="studio-ota" and data-wa="studio-osogbo").
       Same WhatsApp number for now; each studio has its own words so the team knows which one the visitor chose. */
    studioOtaMessage: 'Hello White Physiotherapy, I would like to book a visit to the FlexRecovery Studio in Ota.',
    studioOsogboMessage: 'Hello White Physiotherapy, I would like to book a visit to the FlexRecovery Studio in Osogbo.',
    phoneTel: '+2349029839464',              /* same number as WhatsApp for now */
    phoneDisplay: '+234 902 983 9464',       /* same number as WhatsApp for now */
    email: 'whitephysiotherapy@gmail.com',   /* official email, from Praise */
    emailAdmin: 'admin@whitephysiotherapy.com', /* second email, also shown publicly */
    /* EHR booking page: where every TeleRehab and home-visit "Book" button sends the visitor.
       They pick TeleRehab, Home Visit or Studio and pay there; nothing is booked on this site. */
    ehrBookingLink: 'https://physio.flowvance.co/therapist-profile.html?slug=clinic93',
    /* Message for the "Message us on WhatsApp" fallback on programme pages, next to the EHR booking button. */
    teleRehabMessage: 'Hello White Physiotherapy, I have a question about TeleRehab before I book.'
  };
  window.WHITE_SITE = SITE;

  var whatsappUrl = 'https://wa.me/' + SITE.whatsappNumber + '?text=' + encodeURIComponent(SITE.whatsappMessage);
  var homeVisitUrl = 'https://wa.me/' + SITE.whatsappNumber + '?text=' + encodeURIComponent(SITE.homeVisitMessage);

  /* Optional header button next to the menu on small screens. A page turns it on with
     <body data-header-cta="Book a Visit">. It opens the home-visit WhatsApp message. */
  var headerCtaText = document.body && document.body.getAttribute('data-header-cta');
  /* Optional: <body data-header-cta="Choose a Studio" data-header-cta-href="#choose-studio"> makes the button a plain
     link to that address instead of the home-visit WhatsApp message (used on /studio). */
  var headerCtaHref = document.body && document.body.getAttribute('data-header-cta-href');
  var headerCta = headerCtaText
    ? (headerCtaHref
        ? '<a class="btn btn--primary btn--sm site-header__cta" href="' + headerCtaHref + '">' + headerCtaText + '</a>'
        : '<a class="btn btn--primary btn--sm site-header__cta" data-wa href="' + homeVisitUrl + '" target="_blank" rel="noopener">' + headerCtaText + '</a>')
    : '';

  /* Logo-only header for programme pages (conversion pages, no menu): <body data-header-logo-only>.
     Same bar as the normal header, but it holds the logo alone. */
  var logoOnly = !!(document.body && document.body.hasAttribute('data-header-logo-only'));

  /* Header ------------------------------------------------------------------ */
  var header = logoOnly ?
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<header class="site-header site-header--logo">' +
      '<div class="container site-header__inner">' +
        '<a class="brand" href="/" aria-label="' + SITE.name + ', home">' +
          '<img src="/assets/logo-clinic.png" width="397" height="170" alt="' + SITE.name + ': Rehab, Fitness, Nutrition">' +
        '</a>' +
      '</div>' +
    '</header>' :
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<header class="site-header">' +
      '<div class="container site-header__inner">' +
        '<a class="brand" href="/" aria-label="' + SITE.name + ', home">' +
          '<img src="/assets/logo-clinic.png" width="397" height="170" alt="' + SITE.name + ': Rehab, Fitness, Nutrition">' +
        '</a>' +
        headerCta +
        '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<nav class="nav" id="site-nav" aria-label="Main">' +
          '<ul class="nav__list">' +
            '<li><a class="nav__link" href="/">Home</a></li>' +
            '<li><a class="nav__link" href="/#services">Services</a></li>' +
            '<li><a class="nav__link" href="/#conditions">Conditions</a></li>' +
            '<li><a class="nav__link" href="/#programs">Programs</a></li>' +
            '<li><a class="nav__link" href="/#faq">FAQ</a></li>' +
            '<li class="nav__cta">' +
              '<a class="btn btn--whatsapp btn--block" href="' + whatsappUrl + '" target="_blank" rel="noopener">' +
                '<span class="btn__icon" aria-hidden="true">💬</span> WhatsApp Us' +
              '</a>' +
            '</li>' +
          '</ul>' +
        '</nav>' +
      '</div>' +
    '</header>';

  /* Footer ------------------------------------------------------------------ */
  /* Link lists: [label, url]. Programme slugs are proposed, confirm White's list. */
  var programs = [
    ['Sciatic Nerve Care', '/programmes/sciatica-lower-back-pain'],
    ['Piriformis Syndrome', '/programmes/piriformis-syndrome'],
    ['Cervical Spondylosis', '/programmes/cervical-spondylosis'],
    ['Knee Arthritis', '/programmes/knee-arthritis'],
    ['Carpal Tunnel &amp; De Quervain\'s', '/programmes/carpal-tunnel-de-quervain'],
    ['Erb\'s &amp; Injection Palsy', '/programmes/erbs-palsy-injection-palsy'],
    ['Plantar Fasciitis', '/programmes/plantar-fasciitis'],
    ['Home Visit Booking', '/home-service'],
    ['FlexRecovery Studio', '/studio']
  ];
  var conditions = [
    ['Sciatica &amp; Back Pain', '/programmes/sciatica-lower-back-pain'],
    ['Knee Pain &amp; Arthritis', '/programmes/knee-arthritis'],
    ['Wrist &amp; Hand Pain', '/programmes/carpal-tunnel-de-quervain'],
    ['Nerve Injury Recovery', '/programmes/erbs-palsy-injection-palsy'],
    ['Heel &amp; Foot Pain', '/programmes/plantar-fasciitis'],
    ['Neck &amp; Cervical Pain', '/programmes/cervical-spondylosis'],
    ['Stroke Recovery', '/home-service'],
    ['After-Surgery Recovery', '/home-service'],
    ['Elderly Mobility', '/home-service']
  ];

  /* Small green WhatsApp button, fixed at the bottom right of every page (part of the footer script, so all pages get it).
     A page can set its own opening message: <body data-wa-message="Hello White Physiotherapy, ...">. */
  var floatMessage = (document.body && document.body.getAttribute('data-wa-message')) || SITE.whatsappMessage;
  var floatUrl = 'https://wa.me/' + SITE.whatsappNumber + '?text=' + encodeURIComponent(floatMessage);
  var waFloat =
    '<a class="wa-float" href="' + floatUrl + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
    '</a>';

  function list(items) {
    return '<ul class="site-footer__list">' + items.map(function (i) {
      return '<li><a href="' + i[1] + '">' + i[0] + '</a></li>';
    }).join('') + '</ul>';
  }

  var footer =
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="site-footer__grid">' +
          '<div class="site-footer__brand">' +
            '<a class="site-footer__logo" href="/" aria-label="' + SITE.name + ', home">' +
              '<img src="/assets/logo-clinic-light.png" width="398" height="170" alt="' + SITE.name + '" loading="lazy">' +
            '</a>' +
            '<p class="site-footer__blurb" data-placeholder>Physiotherapy at your home and on your phone, across Nigeria. Choose a home visit, TeleRehab or a visit to our studio.</p>' +
            '<ul class="site-footer__contact">' +
              '<li><span aria-hidden="true">📞</span><a href="tel:' + SITE.phoneTel + '">' + SITE.phoneDisplay + '</a></li>' +
              '<li data-placeholder><span aria-hidden="true">✉️</span><a href="mailto:' + SITE.email + '">' + SITE.email + '</a></li>' +
              '<li data-placeholder><span aria-hidden="true">✉️</span><a href="mailto:' + SITE.emailAdmin + '">' + SITE.emailAdmin + '</a></li>' +
              '<li><span aria-hidden="true">💬</span><span>WhatsApp: <a href="' + whatsappUrl + '" target="_blank" rel="noopener">' + SITE.whatsappDisplay + '</a></span></li>' +
            '</ul>' +
          '</div>' +
          '<nav aria-label="Recovery programs">' +
            '<h2 class="site-footer__title">Recovery Programs</h2>' + list(programs) +
          '</nav>' +
          '<nav aria-label="Conditions">' +
            '<h2 class="site-footer__title">Conditions</h2>' + list(conditions) +
          '</nav>' +
        '</div>' +
        '<p class="site-footer__disclaimer" data-placeholder>Our programmes are home wellness and exercise plans. They do not replace a doctor\'s diagnosis or treatment.</p>' +
        '<div class="site-footer__bar">' +
          '<p>© ' + new Date().getFullYear() + ' ' + SITE.name + '. All rights reserved. <a href="/privacy">Privacy Policy</a></p>' +
          '<p>Official WhatsApp: <a href="' + whatsappUrl + '" target="_blank" rel="noopener">' + SITE.whatsappDisplay + '</a></p>' +
        '</div>' +
      '</div>' +
    '</footer>' +
    waFloat +
    '<button class="back-to-top" type="button" aria-label="Back to top" hidden>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>' +
    '</button>';

  /* Header and footer are now baked as static HTML in every page (so crawlers that do not run
     JavaScript still see them). This script still runs on every page to set window.WHITE_SITE
     (used by main.js and booking.js for WhatsApp links and home-visit prices), but only INSERTS
     the header/footer markup itself as a fallback, if a page does not already have it. */
  var me = document.currentScript;
  if (!me) return;
  var part = me.getAttribute('data-part') || 'header';
  if (part === 'footer') {
    if (!document.querySelector('.site-footer')) me.insertAdjacentHTML('afterend', footer);
  } else {
    if (!document.querySelector('.site-header')) me.insertAdjacentHTML('afterend', header);
  }
})();
