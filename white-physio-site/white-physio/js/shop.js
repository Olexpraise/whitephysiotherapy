/* Product sale popup (the Anti-Inflammatory Herbal Tea) ---------------------------------------------
   A native <dialog class="reg shop" id="shop-tea">, opened by the floating [data-shop-open] button.
   Every page carries this file except /careers -- pages without the button/dialog markup just no-op
   below, so this file is safe to include everywhere without checking per-page.

   NOTHING IS SENT ANYWHERE from this popup -- "Buy Now" is a plain WhatsApp link with a prefilled
   message; White's team handles the actual sale on WhatsApp, same as every other purchase on this site.

   TO CHANGE LATER: the product name, price and deal text live in the HTML (baked into every page), not
   here -- search any page for "shop-tea" to find and edit them everywhere at once. */
(function () {
  'use strict';

  var dlg = document.getElementById('shop-tea');
  var btn = document.querySelector('[data-shop-open]');
  if (!dlg || !btn || typeof dlg.showModal !== 'function') return;

  var root = document.documentElement;

  function open() {
    if (dlg.open) return;
    dlg.showModal();
    root.classList.add('reg-open');
  }
  function close() {
    if (dlg.open) dlg.close();
  }

  btn.addEventListener('click', open);
  dlg.querySelectorAll('[data-shop-close]').forEach(function (b) {
    b.addEventListener('click', close);
  });
  dlg.addEventListener('click', function (e) {   /* a click on the dimmed backdrop closes it */
    if (e.target === dlg) close();
  });
  dlg.addEventListener('close', function () {
    root.classList.remove('reg-open');
  });
})();
