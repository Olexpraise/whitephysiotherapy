/* Cookie consent for the TikTok, Meta and X pixels ---------------------------------------------------------------
   How it fits together:
   - Every page's <head> runs the TikTok snippet with ttq.holdConsent() BEFORE ttq.load(), and the Meta snippet with
     fbq('consent','revoke') BEFORE fbq('init'), so neither collects anything until a visitor says yes.
   - This file shows the banner on a visitor's first visit (nothing chosen yet), saves the choice in
     localStorage ('white_cookie_consent' = 'granted' or 'declined') and tells the pixel:
       Accept  -> ttq.grantConsent() + fbq('consent','grant')    (both start, including the page view that was waiting)
       Decline -> ttq.revokeConsent() + fbq('consent','revoke')  (stay off; if they had accepted before, they stop from now on)
   - A "Cookie settings" link is added to the footer on every page (and any element with
     data-cookie-settings, e.g. the button in privacy.html section 8) to reopen the banner.
   - If localStorage is blocked, the choice cannot be saved, so the banner simply shows again on the next page.
   - Needs no other file. If the pixel is blocked by the visitor's browser, the banner still works and does nothing harmful.
   To change the wording, edit the text in show() below. To change the pixel ID, edit the snippet in each page's <head>. */
(function () {
  'use strict';

  var KEY = 'white_cookie_consent';
  var banner = null;

  function read() {
    try { var v = window.localStorage.getItem(KEY); return v === 'granted' || v === 'declined' ? v : null; } catch (e) { return null; }
  }
  function save(v) { try { window.localStorage.setItem(KEY, v); } catch (e) {} }

  function pixel(method) {
    try { if (window.ttq && typeof window.ttq[method] === 'function') window.ttq[method](); } catch (e) {}
  }

  /* X (Twitter) pixel: X has no "hold consent" switch, so unlike TikTok and Meta it is not in the <head> at all.
     Its script is only downloaded after the visitor accepts (loadX below). Pixel ID rfgrg, conversion event tw-rfgrg-rhbgg.
     window.whiteXOn is true only while consent is granted; js/tiktok-events.js checks it before sending the X event. */
  function loadX() {
    try {
      if (!window.twq) {
        var s = window.twq = function () { s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments); };
        s.version = '1.1'; s.queue = [];
        var u = document.createElement('script');
        u.async = true; u.src = 'https://static.ads-twitter.com/uwt.js';
        var a = document.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(u, a);
      }
      if (!window.whiteXConfigured) { window.whiteXConfigured = true; window.twq('config', 'rfgrg'); }
    } catch (e) {}
  }

  function apply(choice) {
    window.whiteXOn = choice === 'granted';
    if (window.whiteXOn) loadX();
    pixel(choice === 'granted' ? 'grantConsent' : 'revokeConsent');
    try { if (typeof window.fbq === 'function') window.fbq('consent', choice === 'granted' ? 'grant' : 'revoke'); } catch (e) {}
  }

  function hide() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function choose(choice) {
    save(choice);
    apply(choice);
    hide();
  }

  function show() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.innerHTML =
      '<p class="cookie-banner__text"><strong>Your choice about cookies.</strong> We use tracking tools from TikTok, Meta (Facebook and Instagram) and X to see which of our ads bring visitors, and to show our ads to people who may be interested. It only runs if you accept. The site works the same either way. <a href="/privacy#cookies">Read how it works</a>.</p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--primary btn--sm" data-cookie="granted">Accept</button>' +
      '<button type="button" class="btn btn--primary btn--sm" data-cookie="declined">Decline</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-cookie]') : null;
      if (b) choose(b.getAttribute('data-cookie'));
    });
    document.body.appendChild(banner);
  }

  function addFooterLink() {
    var link = document.querySelector('.site-footer a[href="/privacy"]');
    if (!link || document.querySelector('.site-footer [data-cookie-settings]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cookie-link';
    btn.setAttribute('data-cookie-settings', '');
    btn.textContent = 'Cookie settings';
    link.parentNode.insertBefore(btn, link.nextSibling);
    link.parentNode.insertBefore(document.createTextNode(' \u00b7 '), btn);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (t) { e.preventDefault(); show(); }
  });

  function start() {
    var saved = read();
    if (saved) apply(saved); else show();
    addFooterLink();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
