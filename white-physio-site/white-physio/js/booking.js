/* Home-visit booking quiz (/home-service only) ---------------------------------------------------------
   A native <dialog id="book"> with four steps: 1 your details, 2 what is troubling you, 3 your state and area,
   4 your price. Only basic details are asked here; the health details are given on the booking page that
   the Book button will open (linked to White's system, link still to come).

   NOTHING IS SENT ANYWHERE. The answers stay in the page. The visitor can leave for WhatsApp at any step.

   Which buttons open it: every <a data-wa> with NO value (the "Book My Home Visit" buttons, the header button and
   the 12 condition cards). Buttons with a value (data-wa="enquiry" and the studio ones) keep opening WhatsApp.
   A card can pre-tick a problem with data-condition="Knee Pain / Arthritis" (or data-quiz-condition="Other").
   The plain WhatsApp link in the HTML stays as the backup for visitors without JavaScript.
   The address /home-service#book opens the quiz straight away.

   TO CHANGE LATER:
   - Prices: SITE.homeVisitPrices in js/components.js (state -> area -> naira; '*' = whole state).
   - Areas: the STATES list below (White must confirm which areas it really covers).
   - The Book button (the bottom-bar button on step 4) does nothing on purpose until Praise sends the booking link: see bookNow(). */
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
     "My area is not listed" is added to every state by the code below. */
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

  var TOTAL = 4;
  var TITLES = ['', 'Your details', 'What is troubling you?', 'Where should we come to?', 'Your price'];
  var PHONE_OK = function (v) { var d = v.replace(/\D/g, '').length; return d >= 10 && d <= 15; };

  var form = dlg.querySelector('form');
  var steps = Array.prototype.slice.call(dlg.querySelectorAll('.quiz-step'));
  var bar = dlg.querySelector('.quiz__bar');
  var barFill = bar.querySelector('span');
  var stepNote = dlg.querySelector('[data-quiz-stepnote]');
  var backBtn = dlg.querySelector('[data-quiz-back]');
  var nextBtn = dlg.querySelector('[data-quiz-next]');
  var actions = dlg.querySelector('.quiz__actions');
  var waLinks = Array.prototype.slice.call(dlg.querySelectorAll('[data-quiz-wa]'));

  var f = {
    name: form.elements['name'],
    whatsapp: form.elements['whatsapp'],
    same: form.elements['phone-same'],
    phone: form.elements['phone'],
    state: form.elements['state'],
    area: form.elements['area']
  };
  var phoneBox = dlg.querySelector('[data-quiz-phonebox]');
  var step = 1;
  all('[data-quiz-preview]').forEach(function (el) { el.hidden = !isPreview; });     /* preview builds only */

  function all(sel) { return Array.prototype.slice.call(dlg.querySelectorAll(sel)); }
  function conditions() { return all('input[name="condition"]:checked').map(function (i) { return i.value; }); }
  function clean(v) { return (v || '').replace(/\s+/g, ' ').trim(); }

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

  /* ---- Price lookup: SITE.homeVisitPrices[state][area], or [state]['*'] for the whole state ----------- */
  function priceFor(state, area) {
    var table = site.homeVisitPrices && site.homeVisitPrices[state];
    if (!table) return 0;
    var p = table[area];
    if (typeof p !== 'number') p = table['*'];
    return typeof p === 'number' && p > 0 ? p : 0;
  }

  /* ---- WhatsApp: the visitor can switch at any step; the message carries what we know so far ---------- */
  function whatsappHref() {
    var msg = site.homeVisitMessage || 'Hello White Physiotherapy, I would like to book a home physiotherapy visit.';
    var name = clean(f.name.value);
    var list = conditions();
    if (name) msg += ' My name is ' + name + '.';
    if (list.length) msg += ' My problem is: ' + list.join(', ') + '.';
    if (f.state.value && f.area.value) {
      msg += f.area.value === NOT_LISTED
        ? ' I live in ' + f.state.value + ' and my area is not on your list.'
        : ' I live in ' + f.area.value + ', ' + f.state.value + '.';
    }
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
    stepNote.textContent = 'Step ' + n + ' of ' + TOTAL + (n === 1 ? ' \u00B7 about 1 minute' : '');
    bar.setAttribute('aria-valuenow', String(n));
    barFill.style.width = (n / TOTAL * 100) + '%';
    backBtn.hidden = n === 1;
    nextBtn.textContent = n === TOTAL ? 'Book My Home Visit' : 'Continue';       /* on the last step this button is the Book button */
    actions.classList.toggle('quiz__actions--last', n === TOTAL);
    if (n === 4) renderPrice();
    refreshWa();
    dlg.scrollTop = 0;
    if (focusTitle) {
      var t = steps[n - 1].querySelector('.quiz-step__title');
      if (t) t.focus({ preventScroll: true });
    }
  }

  function renderPrice() {
    var state = f.state.value;
    var area = f.area.value;
    var where = area === NOT_LISTED ? state : area + ', ' + state;
    var amount = priceFor(state, area);
    var example = false;
    if (!amount && isPreview) { amount = 0; example = true; }      /* previews show an example so the layout can be judged */

    var box = dlg.querySelector('[data-quiz-pricebox]');
    var amountEl = dlg.querySelector('[data-quiz-amount]');
    var noteEl = dlg.querySelector('[data-quiz-pricenote]');
    var exampleEl = dlg.querySelector('[data-quiz-example]');

    dlg.querySelector('[data-quiz-where]').textContent = where;
    var where2El = dlg.querySelector('[data-quiz-where2]');
    if (where2El) where2El.textContent = where;
    box.classList.toggle('is-unknown', !amount && !example);
    if (amount) {
      amountEl.textContent = '\u20A6' + amount.toLocaleString('en-US');
      noteEl.hidden = false;
    } else if (example) {
      amountEl.textContent = '\u20A600,000';
      noteEl.hidden = false;
    } else {
      amountEl.textContent = 'We will tell you your price';
      noteEl.hidden = true;
    }
    exampleEl.hidden = !example;

    var list = conditions();
    dlg.querySelector('[data-quiz-sum-name]').textContent = clean(f.name.value);
    dlg.querySelector('[data-quiz-sum-cond]').textContent = list.join(', ');
    dlg.querySelector('[data-quiz-sum-where]').textContent = where;
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
      var name = clean(f.name.value);
      need(f.name, name.length < 2 ? 'Please enter your name.' : '');
      var wa = f.whatsapp.value.trim();
      need(f.whatsapp, !wa ? 'Please enter your WhatsApp number.' : (!PHONE_OK(wa) ? 'Please enter a valid phone number, for example 08012345678.' : ''));
      if (f.same.checked) {
        mark(f.phone, '');
      } else {
        var ph = f.phone.value.trim();
        need(f.phone, !ph ? 'Please enter your phone number, or tick the box above.' : (!PHONE_OK(ph) ? 'Please enter a valid phone number, for example 08012345678.' : ''));
      }
    }
    if (n === 2) {
      var first = dlg.querySelector('input[name="condition"]');
      if (!conditions().length) { mark(first, 'Please choose at least one.'); bad.push(first); } else { mark(first, ''); }
    }
    if (n === 3) {
      need(f.state, f.state.value ? '' : 'Please choose your state.');
      need(f.area, f.area.value ? '' : 'Please choose your area.');
    }
    if (bad.length) {
      bad[0].focus({ preventScroll: true });
      var fld = fieldOf(bad[0]);
      if (fld) fld.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  /* ---- Buttons and fields ---------------------------------------------------------------------------- */
  form.addEventListener('submit', function (e) {                    /* Enter key or the Continue button */
    e.preventDefault();
    if (step >= TOTAL) { bookNow(); return; }
    if (!check(step)) return;
    render(step + 1, true);
  });
  backBtn.addEventListener('click', function () { if (step > 1) render(step - 1, true); });

  function samePhone() {
    phoneBox.hidden = f.same.checked;
    if (f.same.checked) mark(f.phone, '');
  }
  f.same.addEventListener('change', samePhone);
  samePhone();

  f.state.addEventListener('change', function () { fillAreas(); mark(f.state, ''); mark(f.area, ''); refreshWa(); });
  f.area.addEventListener('change', function () { mark(f.area, ''); refreshWa(); });

  form.addEventListener('input', function (e) {                     /* an error goes away as soon as it is fixed */
    var t = e.target;
    if (t === f.name || t === f.whatsapp || t === f.phone) {
      var fld = fieldOf(t);
      if (fld && fld.classList.contains('is-invalid')) mark(t, '');
    }
    if (t.name === 'condition') {
      var first = dlg.querySelector('input[name="condition"]');
      if (conditions().length) mark(first, '');
    }
    refreshWa();
  });

  /* The Book button: it does NOTHING on purpose until the booking link exists.
     WHEN THE LINK ARRIVES: put it in SITE (js/components.js) and open it here. The visitor's answers are available
     as clean(f.name.value), f.whatsapp.value, f.same.checked ? f.whatsapp.value : f.phone.value, conditions(),
     f.state.value and f.area.value. */
  function bookNow() { /* pending: booking link */ }

  /* ---- Opening and closing --------------------------------------------------------------------------- */
  function open(pre) {
    if (pre) {
      all('input[name="condition"]').forEach(function (i) { i.checked = i.value === pre; });
      mark(dlg.querySelector('input[name="condition"]'), '');
    }
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
    open(a.getAttribute('data-quiz-condition') || a.getAttribute('data-condition'));
  });
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
