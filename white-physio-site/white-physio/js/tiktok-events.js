/* TikTok Pixel events ---------------------------------------------------------------------------------
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

  function track(name, params) {
    try { if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track(name, params || {}); } catch (e) {}
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
