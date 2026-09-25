/* Home-visit booking quiz (/home-service only) ---------------------------------------------------------
   A native <dialog id="book"> with three steps: 1 your state and area, 2 what's troubling you, 3 your price.
   The condition in step 2 does NOT affect price — it's collected only so White's team knows what they're
   walking into. Only the state (via its pricing tier) changes the number shown in step 3.

   After the price, the EHR booking page (SITE.ehrBookingLink, js/components.js) is where booking actually
   happens — that page has its own form and its own choice of TeleRehab, Home Visit or Studio, so none of
   that is duplicated here. WhatsApp stays offered at every step for anyone unsure.

   NOTHING IS SENT ANYWHERE from this dialog — the state/area/condition choices only decide what's shown.

   Which buttons open it: every <a data-wa> with NO value (every "Book My Home Visit" button, the header
   button, the "Get Your Personalised Plan" band and the 12 condition cards — the cards no longer pre-tick
   anything, since step 2 asks anyway). Buttons with a value (data-wa="enquiry" and the studio ones) keep
   opening WhatsApp directly. The plain WhatsApp link stays as the backup for visitors without JavaScript.
   The address /home-service#book opens the quiz straight away.

   TO CHANGE LATER:
   - Pricing tiers, the mobilisation fee: SITE.homeVisitPricing / SITE.homeVisitMobilizationFee in js/components.js.
   - Areas: the STATES list below (White must confirm which areas it really covers).
   - The booking link: SITE.ehrBookingLink in js/components.js. */
(function () {
  'use strict';

  var dlg = document.getElementById('book');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  var site = window.WHITE_SITE || {};
  var root = document.documentElement;
  var isPreview = document.body.hasAttribute('data-form-preview');

  /* ---- States and areas (PLACEHOLDER: White confirms the real areas it covers) ----------------------
     Lagos first (main area), then A to Z. Yoruba-land states, Abuja, Kaduna, Kano and the states next to
     Yoruba land list a few areas; far states list two or three, capital included.
     "My area is not listed" is added to every state by the code below. Area does NOT affect price — only
     the state does, via its pricing tier (js/components.js, SITE.homeVisitPricing). */
  var STATES = [
    ['Lagos', ['Ikeja', 'Maryland', 'Ojota', 'Gbagada', 'Yaba', 'Surulere', 'Victoria Island', 'Ikoyi', 'Lekki', 'Ajah', 'Ikorodu', 'Alimosho', 'Agege', 'Festac Town', 'Apapa', 'Badagry']],
    ['Abia', ['Umuahia', 'Aba']],
    ['Abuja (FCT)', ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Jabi', 'Kubwa', 'Lugbe']],
    ['Adamawa', ['Yola', 'Mubi']],
    ['Akwa Ibom', ['Uyo', 'Eket', 'Ikot Ekpene']],
    ['Anambra', ['Awka', 'Onitsha', 'Nnewi']],
    ['Bauchi', ['Bauchi', 'Azare']],
    ['Bayelsa', ['Yenagoa', 'Sagbama']],
    ['Benue', ['Makurdi', 'Gboko', 'Otukpo']],
    ['Borno', ['Maiduguri', 'Biu']],
    ['Cross River', ['Calabar', 'Ikom', 'Ogoja']],
    ['Delta', ['Asaba', 'Warri', 'Sapele']],
    ['Ebonyi', ['Abakaliki', 'Afikpo']],
    ['Edo', ['Benin City', 'Ekpoma', 'Auchi']],
    ['Ekiti', ['Ado-Ekiti', 'Ikere-Ekiti', 'Ijero-Ekiti']],
    ['Enugu', ['Enugu', 'Nsukka']],
    ['Gombe', ['Gombe', 'Billiri']],
    ['Imo', ['Owerri', 'Orlu', 'Okigwe']],
    ['Jigawa', ['Dutse', 'Hadejia', 'Gumel']],
    ['Kaduna', ['Kaduna Central', 'Barnawa', 'Zaria', 'Kafanchan']],
    ['Kano', ['Kano Municipal', 'Nassarawa GRA', 'Sabon Gari', 'Bompai']],
    ['Katsina', ['Katsina', 'Daura', 'Funtua']],
    ['Kebbi', ['Birnin Kebbi', 'Argungu', 'Zuru']],
    ['Kogi', ['Lokoja', 'Okene', 'Kabba']],
    ['Kwara', ['Ilorin', 'Offa', 'Omu-Aran']],
    ['Nasarawa', ['Lafia', 'Keffi', 'Karu']],
    ['Niger', ['Minna', 'Suleja', 'Bida']],
    ['Ogun', ['Abeokuta', 'Ota', 'Sagamu', 'Ijebu Ode', 'Ifo', 'Ilaro']],
    ['Ondo', ['Akure', 'Ondo Town', 'Owo', 'Ikare-Akoko']],
    ['Osun', ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Iwo']],
    ['Oyo', ['Ibadan (Bodija)', 'Ibadan (Ring Road)', 'Ibadan (Challenge)', 'Ogbomosho', 'Oyo Town']],
    ['Plateau', ['Jos', 'Bukuru']],
    ['Rivers', ['Port Harcourt', 'Obio-Akpor']],
    ['Sokoto', ['Sokoto', 'Tambuwal']],
    ['Taraba', ['Jalingo', 'Wukari']],
    ['Yobe', ['Damaturu', 'Potiskum', 'Gashua']],
    ['Zamfara', ['Gusau', 'Kaura Namoda', 'Talata Mafara']]
  ];
  var NOT_LISTED = 'My area is not listed';

  var TOTAL = 3;
  var form = dlg.querySelector('form');
  var steps = Array.prototype.slice.call(dlg.querySelectorAll('.quiz-step'));
  var bar = dlg.querySelector('.quiz__bar');
  var barFill = bar.querySelector('span');
  var stepNote = dlg.querySelector('[data-quiz-stepnote]');
  var backBtn = dlg.querySelector('[data-quiz-back]');
  var nextBtn = dlg.querySelector('[data-quiz-next]');
  var actions = dlg.querySelector('.quiz__actions');
  var waLinks = Array.prototype.slice.call(dlg.querySelectorAll('[data-quiz-wa]'));

  var f = { state: form.elements['state'], area: form.elements['area'] };
  var step = 1;

  function all(sel) { return Array.prototype.slice.call(dlg.querySelectorAll(sel)); }
  all('[data-quiz-preview]').forEach(function (el) { el.hidden = !isPreview; });     /* preview builds only */

  /* ---- Fill the state list and the area list -------------------------------------------------------- */
  (function fillStates() {
    STATES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s[0];
      o.textContent = s[0];
      f.state.appendChild(o);
    });
  })();

  function fillAreas() {
    var chosen = f.state.value;
    while (f.area.firstChild) f.area.removeChild(f.area.firstChild);
    var first = document.createElement('option');
    first.value = '';
    first.textContent = chosen ? 'Choose your area' : 'Choose your state first';
    f.area.appendChild(first);
    f.area.disabled = !chosen;
    if (!chosen) return;
    var list = [];
    STATES.forEach(function (s) { if (s[0] === chosen) list = s[1]; });
    list.concat([NOT_LISTED]).forEach(function (a) {
      var o = document.createElement('option');
      o.value = a;
      o.textContent = a;
      f.area.appendChild(o);
    });
  }
  fillAreas();

  function condition() {
    var el = form.querySelector('input[name="condition"]:checked');
    return el ? el.value : '';
  }

  /* ---- Pricing: two tiers (SITE.homeVisitPricing), not one price per state --------------------------
     Lagos/Abuja/Rivers pay the tierA rate; every other state pays tierB. Package totals for 8 or 12
     sessions are just the per-session rate times the session count — there's no separate config for them. */
  var EXAMPLE_PRICING = { tierACities: [], tierA: { before: 50000, now: 45000 }, tierB: { before: 40000, now: 35000 } };
  function pricing() { return (site.homeVisitPricing && site.homeVisitPricing.tierA && site.homeVisitPricing.tierB) ? site.homeVisitPricing : (isPreview ? EXAMPLE_PRICING : null); }
  function tierFor(state, p) { return (p.tierACities || []).indexOf(state) > -1 ? 'tierA' : 'tierB'; }
  function rateFor(state) {
    var p = pricing();
    if (!p || !state) return null;
    return p[tierFor(state, p)];
  }
  function naira(n) { return '\u20A6' + Math.round(n).toLocaleString('en-US'); }

  /* ---- WhatsApp: the visitor can switch at any step; the message carries area + condition when chosen -- */
  function whatsappHref() {
    var msg = site.homeVisitMessage || 'Hello White Physiotherapy, I would like to book a home physiotherapy visit.';
    if (f.state.value && f.area.value) {
      msg += f.area.value === NOT_LISTED
        ? ' I live in ' + f.state.value + ' and my area is not on your list.'
        : ' I live in ' + f.area.value + ', ' + f.state.value + '.';
    }
    if (condition()) msg += ' My main problem is ' + condition() + '.';
    return 'https://wa.me/' + (site.whatsappNumber || '2349029839464') + '?text=' + encodeURIComponent(msg);
  }
  function refreshWa() {
    var href = whatsappHref();
    waLinks.forEach(function (a) { a.href = href; });
  }

  /* ---- Showing one step at a time -------------------------------------------------------------------- */
  function render(n, focusTitle) {
    step = n;
    steps.forEach(function (s, i) { s.hidden = i + 1 !== n; });
    var noteWords = { 1: '', 2: '', 3: '' };
    stepNote.textContent = 'Step ' + n + ' of ' + TOTAL + (noteWords[n] || '');
    bar.setAttribute('aria-valuenow', String(n));
    barFill.style.width = (n / TOTAL * 100) + '%';
    backBtn.hidden = n === 1;
    nextBtn.textContent = n === TOTAL ? 'Book on Our Booking Page' : 'Continue';       /* on the last step this button opens the EHR link */
    actions.classList.toggle('quiz__actions--last', n === TOTAL);
    if (n === TOTAL) renderPrice();
    refreshWa();
    dlg.scrollTop = 0;
    if (focusTitle) {
      var t = steps[n - 1].querySelector('.quiz-step__title');
      if (t) t.focus({ preventScroll: true });
    }
  }

  function row(name, html) {
    var el = dlg.querySelector('[data-row="' + name + '"]');
    if (el) el.innerHTML = html;
  }

  function renderPrice() {
    var state = f.state.value;
    var area = f.area.value;
    var where = area === NOT_LISTED ? state : area + ', ' + state;
    var rate = rateFor(state);
    var example = isPreview && !(site.homeVisitPricing && site.homeVisitPricing.tierA);

    /* Location + condition summary pills */
    var tagsEl = dlg.querySelector('[data-quiz-tags]');
    tagsEl.innerHTML =
      '<span class="pill pill--on-dark pill--dot">\uD83D\uDCCD ' + where + '</span>' +
      (condition() ? '<span class="pill pill--on-dark pill--dot">\uD83D\uDC8A ' + condition() + '</span>' : '');

    var noteEl = dlg.querySelector('[data-quiz-pricenote]');
    var exampleEl = dlg.querySelector('[data-quiz-example]');
    var table = dlg.querySelector('[data-quiz-table]');
    var totalBox = dlg.querySelector('.quiz-total');
    var altPlan = dlg.querySelector('.quiz-alt-plan');
    var feeNote = dlg.querySelector('.quiz-fee-note');
    var miniCmp = dlg.querySelector('.quiz-mini-cmp');

    if (!rate) {                                    /* no pricing tier configured yet, and not a preview build */
      table.hidden = true; totalBox.hidden = true; altPlan.hidden = true; feeNote.hidden = true; miniCmp.hidden = true;
      exampleEl.hidden = true;
      noteEl.hidden = false;
      return;
    }
    table.hidden = false; totalBox.hidden = false; altPlan.hidden = false; feeNote.hidden = false; miniCmp.hidden = false;
    noteEl.hidden = false;
    exampleEl.hidden = !example;

    var fee = typeof site.homeVisitMobilizationFee === 'number' ? site.homeVisitMobilizationFee : 25000;
    var now8 = rate.now * 8, before8 = rate.before * 8;
    var now12 = rate.now * 12;
    var balance = now8 - fee, beforeBalance = before8 - fee;
    var pay1 = balance * 0.7, pay2 = balance * 0.3;
    var beforePay1 = beforeBalance * 0.7, beforePay2 = beforeBalance * 0.3;
    var discount = before8 - now8;

    function cell(now, before) {
      return before > now
        ? naira(now) + ' <s>' + naira(before) + '</s>'
        : naira(now);
    }

    row('perSession', cell(rate.now, rate.before));
    row('packageTotal', cell(now8, before8));
    row('fee', naira(fee));
    row('pay1', cell(pay1, beforePay1));
    row('pay2', cell(pay2, beforePay2));
    row('packageTotalBig', naira(now8));
    row('packageTotalMini', naira(now8));
    row('packageTotal12', naira(now12) + (rate.before > rate.now ? ' <s>' + naira(before12()) + '</s>' : ''));
    row('feeInline', naira(fee));

    function before12() { return rate.before * 12; }

    var discountEl = dlg.querySelector('[data-row="discountNote"]');
    if (discount > 0) {
      discountEl.hidden = false;
      discountEl.textContent = naira(discount) + ' discount applied';
    } else {
      discountEl.hidden = true;
    }
  }

  /* ---- Checking each step ---------------------------------------------------------------------------- */
  function fieldOf(el) { return el.closest ? el.closest('.reg-field') : null; }
  function mark(el, msg) {
    var field = fieldOf(el);
    if (!field) return;
    var err = field.querySelector('.reg-error');
    field.classList.toggle('is-invalid', !!msg);
    if (el.setAttribute) { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
    if (err) { err.textContent = msg || ''; err.hidden = !msg; }
  }

  function check(n) {
    var bad = [];
    function need(el, msg) { if (msg) { mark(el, msg); bad.push(el); } else { mark(el, ''); } }

    if (n === 1) {
      need(f.state, f.state.value ? '' : 'Please choose your state.');
      need(f.area, f.area.value ? '' : 'Please choose your area.');
    }
    if (n === 2) {
      var errEl = document.getElementById('quiz-cond-err');
      if (!condition()) {
        if (errEl) { errEl.textContent = 'Please pick what\u2019s troubling you most.'; errEl.hidden = false; }
        var first = form.querySelector('input[name="condition"]');
        if (first) bad.push(first);
      } else if (errEl) { errEl.hidden = true; }
    }
    if (bad.length) {
      bad[0].focus({ preventScroll: true });
      var fld = fieldOf(bad[0]) || bad[0].closest('.reg-field');
      if (fld) fld.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  /* ---- Buttons and fields ---------------------------------------------------------------------------- */
  form.addEventListener('submit', function (e) {                    /* Enter key or the Continue/Book button */
    e.preventDefault();
    if (step >= TOTAL) { bookNow(); return; }
    if (!check(step)) return;
    render(step + 1, true);
  });
  backBtn.addEventListener('click', function () { if (step > 1) render(step - 1, true); });

  f.state.addEventListener('change', function () { fillAreas(); mark(f.state, ''); mark(f.area, ''); refreshWa(); });
  f.area.addEventListener('change', function () { mark(f.area, ''); refreshWa(); });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'condition') refreshWa();
  });

  /* The Book button (step 3): opens White's EHR booking page in a new tab. The visitor picks Home Visit
     there and shares the rest of their details on that page — nothing is booked from this dialog. */
  function bookNow() {
    var link = site.ehrBookingLink || 'https://physio.flowvance.co/therapist-profile.html?slug=clinic93';
    window.open(link, '_blank', 'noopener');
  }

  /* ---- Opening and closing --------------------------------------------------------------------------- */
  function open() {
    if (dlg.open) return;
    render(1, false);
    dlg.showModal();
    dlg.scrollTop = 0;
    root.classList.add('reg-open');
  }
  function close() { if (dlg.open) dlg.close(); }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[data-wa]') : null;
    if (!a || a.getAttribute('data-wa')) return;                    /* "enquiry" and studio buttons stay WhatsApp */
    e.preventDefault();
    open();
  }, true);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });   /* a click on the dimmed area closes it */
  all('[data-quiz-close]').forEach(function (b) { b.addEventListener('click', close); });
  dlg.addEventListener('close', function () {
    root.classList.remove('reg-open');
    if (window.location.hash === '#book' && window.history && history.replaceState) {   /* so the same link can open it again */
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  if (window.location.hash === '#book') open();
  window.addEventListener('hashchange', function () { if (window.location.hash === '#book') open(); });
})();
