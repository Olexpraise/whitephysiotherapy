/* TikTok + Meta + X Pixel events ---------------------------------------------------------------------------------
   The pixel itself (page views) is the "TikTok Pixel Code" block in the <head> of every page.
   This file adds the two actions worth optimising ads for. It does nothing if the pixel is blocked
   (ad blockers, privacy browsers), so it can never break a page.

   - Any WhatsApp link (wa.me, incl. the floating button and the shop popup)  -> "Contact"
   - Any link to the EHR booking page (physiohrs.com/intake...)               -> "ClickButton"
   - The home-visit quiz "Book on Our Booking Page" button opens the same page via js/booking.js,
     which calls window.whiteTrackBooking() below.
   Bookings and payments happen on the EHR site, which this pixel cannot see, so "ClickButton" counts
   people who left to book, not completed bookings.

   Pixel ID: DB3CJ5RC77U534NEID8G (same ID in every page's head). */
(function () {
  'use strict';

  /* One call sends the action to both pixels. Names differ: TikTok "ClickButton" = Meta "Lead" (a booking-page click);
     TikTok "Contact" = Meta "Contact" (a WhatsApp tap). Each pixel is skipped if it is blocked or not loaded. */
  function track(name, params) {
    try { if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track(name, params || {}); } catch (e) {}
    var metaName = name === 'ClickButton' ? 'Lead' : name;
    try { if (typeof window.fbq === 'function') window.fbq('track', metaName, params || {}); } catch (e) {}
    /* X: one conversion event for both actions (WhatsApp tap and booking-page click). Only after the visitor accepted cookies
       (js/consent.js sets whiteXOn and loads the X script). To tell the two apart in X, make a second event in X Ads
       Manager and pass its ID for one of the two names here. */
    try {
      if (window.whiteXOn && typeof window.twq === 'function') {
        window.twq('event', 'tw-rfgrg-rhbgg', { conversion_id: null, email_address: null, phone_number: null });
      }
    } catch (e) {}
  }

  window.whiteTrackBooking = function () { track('ClickButton', { description: 'Booking page (home-visit quiz)' }); };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me/') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
      track('Contact', { description: 'WhatsApp' });
    } else if (href.indexOf('physiohrs.com/intake') !== -1) {
      track('ClickButton', { description: 'Booking page' });
    }
  });
})();
