/* Site behaviour. Load with: <script src="/js/main.js" defer></script> */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var backToTop = document.querySelector('.back-to-top');

  /* Back to top: appears after scrolling down a little */
  if (backToTop) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var syncBackToTop = function () { backToTop.hidden = window.scrollY < 600; };
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', syncBackToTop, { passive: true });
    syncBackToTop();
  }

  if (!header) return;

  var toggle = header.querySelector('.nav-toggle');
  var nav = header.querySelector('.nav');

  /* Soft shadow once the page scrolls */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Logo-only header (programme pages) has no menu to set up */
  if (!toggle || !nav) return;

  function isOpen() {
    return nav.classList.contains('is-open');
  }

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  /* Close after tapping a link */
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  /* Close on Escape, or a tap outside the header */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  /* Reset when the screen grows to desktop width */
  var desktop = window.matchMedia('(min-width: 900px)');
  function onBreakpoint(e) { if (e.matches) setOpen(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);

})();

/* Video cards (patient stories now, sample and testimonial videos on programme pages).
   Usage: <div class="video-card" data-video-id="PASTE A YOUTUBE LINK OR THE 11-CHARACTER ID">
   With no link the card shows as "Video coming soon". With a link it shows the real YouTube
   thumbnail and loads the player only when tapped, which keeps the page fast.
   A card can also hold its own cover image: <img class="video-card__cover" ...> as the first child.
   The cover then shows instead of the YouTube thumbnail (delete the <img> to use the thumbnail). */
(function () {
  'use strict';

  function parseId(value) {
    value = (value || '').trim();
    if (!value) return '';
    if (/^[\w-]{11}$/.test(value)) return value;
    var m = value.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : '';
  }

  function play(card, id, title) {
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
    frame.title = title || 'Video';
    frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.className = 'video-card__frame';
    card.innerHTML = '';
    card.appendChild(frame);
    card.classList.add('is-playing');
  }

  document.querySelectorAll('.video-card').forEach(function (card) {
    var btn = card.querySelector('.video-card__btn');
    var id = parseId(card.getAttribute('data-video-id'));
    if (!btn) return;
    if (!id) {                       /* no video yet */
      btn.disabled = true;
      return;
    }
    btn.disabled = false;
    card.setAttribute('data-ready', '');
    card.style.setProperty('--thumb', 'url("https://img.youtube.com/vi/' + id + '/hqdefault.jpg")');
    btn.addEventListener('click', function () {
      var t = card.querySelector('.video-card__title');
      play(card, id, t ? t.textContent : (btn.getAttribute('aria-label') || '').replace(/^Play video: /, ''));
    });
  });
})();


/* Count-up numbers (trust numbers). Mark a number like this:
     <span class="cnt" data-to="10000" data-comma>10,000</span>
   The real number stays in the HTML (search engines and no-JavaScript visitors see it).
   When the number scrolls into view it counts up once. Skipped when the visitor has asked for less motion. */
(function () {
  'use strict';
  var nodes = document.querySelectorAll('.cnt[data-to]');
  if (!nodes.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var DURATION = 1600;
  function format(n, comma) { return comma ? n.toLocaleString('en-US') : String(n); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function run(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    var comma = el.hasAttribute('data-comma');
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / DURATION, 1);
      el.textContent = format(Math.round(to * ease(t)), comma);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = format(to, comma);
    }
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });

  nodes.forEach(function (el) {
    var final = el.textContent;
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (isNaN(to)) return;
    /* Screen readers hear the final number once, not every step of the count */
    var wrap = el.closest('.stats__num, .stories__num');
    if (wrap && !wrap.hasAttribute('aria-hidden')) {
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = wrap.textContent.replace(/\s+/g, ' ').trim();
      wrap.parentNode.insertBefore(sr, wrap);
      wrap.setAttribute('aria-hidden', 'true');
    }
    el.style.minWidth = el.getBoundingClientRect().width + 'px';   /* lock the width */
    el.textContent = '0';
    io.observe(el);
  });
})();

/* Home-visit buttons (/home-service). Every "Book My Home Visit" style button is marked data-wa.
   For now they open WhatsApp with the message in SITE.homeVisitMessage (js/components.js).
   A button can add a condition: <a data-wa data-condition="Knee pain"> adds it to the message.
   A plain question button uses the general message instead: <a data-wa="enquiry">.
   The two studio buttons on /studio use their own messages: <a data-wa="studio-ota"> and <a data-wa="studio-osogbo">.
   The plain link in the HTML is only a backup for visitors without JavaScript.
   WHEN THE BOOKING FLOW (quiz, location, price, Book) IS READY: change this one block, or point
   the buttons at the new flow. Nothing else on the page needs to change. */
(function () {
  'use strict';

  var site = window.WHITE_SITE;
  if (!site) return;

  Array.prototype.forEach.call(document.querySelectorAll('a[data-wa]'), function (link) {
    var messages = {
      'enquiry': site.whatsappMessage,
      'studio-ota': site.studioOtaMessage,
      'studio-osogbo': site.studioOsogboMessage
    };
    var message = messages[link.getAttribute('data-wa')] || site.homeVisitMessage;
    var condition = link.getAttribute('data-condition');
    if (condition) message += ' My problem is: ' + condition + '.';
    link.href = 'https://wa.me/' + site.whatsappNumber + '?text=' + encodeURIComponent(message);
    link.target = '_blank';
    link.rel = 'noopener';
  });
})();

/* Swipe carousel. Markup: <div class="carousel" data-carousel> with a .carousel__track (the slides) and a
   .carousel__nav (arrows and dots). Visitors can always swipe or scroll the track; this adds the arrows,
   the dots, and hides the arrows when every slide already fits on screen. */
(function () {
  'use strict';

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (root) {
    var track = root.querySelector('.carousel__track');
    var nav = root.querySelector('.carousel__nav');
    var prev = root.querySelector('.carousel__btn--prev');
    var next = root.querySelector('.carousel__btn--next');
    var dotsBox = root.querySelector('.carousel__dots');
    if (!track || !nav || !prev || !next || !dotsBox) return;

    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    var dots = slides.map(function () {
      var dot = document.createElement('span');
      dot.className = 'carousel__dot';
      dotsBox.appendChild(dot);
      return dot;
    });

    function current() {
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      if (atEnd) return slides.length - 1;
      var best = 0, gap = Infinity;
      slides.forEach(function (slide, i) {
        var d = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (d < gap) { gap = d; best = i; }
      });
      return best;
    }

    function update() {
      nav.hidden = track.scrollWidth <= track.clientWidth + 2;
      var i = current();
      dots.forEach(function (dot, n) { dot.classList.toggle('is-active', n === i); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }

    function go(step) {
      var i = Math.max(0, Math.min(slides.length - 1, current() + step));
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce && reduce.matches ? 'auto' : 'smooth' });
    }

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', update);
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    update();
  });
})();

/* Registration form (programme pages) ------------------------------------------------------------
   A native <dialog class="reg"> holds a Netlify form. Any link with data-register opens it.
   On submit: check the fields, POST to Netlify (form name "registration"), then open the shared /payment page
   with the programme, first name and amount in the link. Without JavaScript the form still posts, and Netlify
   sends the visitor to /payment (the form's action) with no extra details. */
(function () {
  'use strict';
  var dlg = document.getElementById('register');      /* by id: /home-service has its own dialog (id "book", js/booking.js) with the same look */
  if (!dlg || typeof dlg.showModal !== 'function') return;

  var root = document.documentElement;
  var form = dlg.querySelector('form');
  var submitBtn = form.querySelector('[type="submit"]');
  var fail = dlg.querySelector('.reg-status__fail');
  var fields = Array.prototype.slice.call(form.querySelectorAll('.reg-field'));
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function openForm() {
    if (dlg.open) return;
    dlg.showModal();
    dlg.scrollTop = 0;
    root.classList.add('reg-open');
  }
  function closeForm() { if (dlg.open) dlg.close(); }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-register]') : null;
    if (!trigger) return;
    e.preventDefault();
    openForm();
  });
  dlg.addEventListener('click', function (e) {        /* a click on the dimmed area (the dialog itself) closes it */
    if (e.target === dlg) closeForm();
  });
  Array.prototype.forEach.call(dlg.querySelectorAll('[data-reg-close]'), function (b) {
    b.addEventListener('click', closeForm);
  });
  dlg.addEventListener('close', function () { root.classList.remove('reg-open'); });
  if (window.location.hash === '#register') openForm();

  /* ---- checking the fields ---- */
  function control(field) { return field.querySelector('input:not([type="hidden"])'); }

  function problem(field) {
    var kind = field.getAttribute('data-kind');
    var inputs = field.querySelectorAll('input:not([type="hidden"])');
    var v;
    if (kind === 'choice' || kind === 'confirm') {
      for (var i = 0; i < inputs.length; i++) { if (inputs[i].checked) return null; }
      return 'missing';
    }
    v = inputs[0].value.trim();
    if (!v) return 'missing';
    if (kind === 'phone') {
      var digits = v.replace(/\D/g, '').length;
      if (digits < 10 || digits > 15) return 'format';
    }
    if (kind === 'email' && !EMAIL.test(v)) return 'format';
    return null;
  }

  function show(field, kind) {
    var msg = field.querySelector('.reg-error');
    var inputs = field.querySelectorAll('input:not([type="hidden"])');
    field.classList.toggle('is-invalid', !!kind);
    Array.prototype.forEach.call(inputs, function (i) {
      if (kind) { i.setAttribute('aria-invalid', 'true'); } else { i.removeAttribute('aria-invalid'); }
    });
    if (kind) {
      msg.textContent = kind === 'format' ? field.getAttribute('data-error-format') : field.getAttribute('data-error');
      msg.hidden = false;
    } else {
      msg.hidden = true;
    }
  }

  function clearOnEdit(e) {                           /* the message goes away as soon as the person fixes the field */
    var field = e.target.closest ? e.target.closest('.reg-field') : null;
    if (field && field.classList.contains('is-invalid')) show(field, problem(field));
  }
  form.addEventListener('input', clearOnEdit);
  form.addEventListener('change', clearOnEdit);

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? 'Sending\u2026' : 'Submit form';
  }

  function previewDone() {                            /* previews only (build_preview.py adds data-form-preview) */
    var note = document.createElement('div');
    note.className = 'reg-preview';
    note.setAttribute('role', 'status');
    note.innerHTML = '<p><strong>Preview only. Nothing was sent.</strong></p>' +
      '<p>On the live site the registration is saved, then the shared payment page opens with the visitor\u2019s first name, the programme and the amount.</p>';
    var previewLinks = window.__PREVIEW_LINKS;          /* set only by build_preview.py: a link to the payment page preview */
    if (previewLinks && previewLinks.payment) {
      var see = document.createElement('a');
      see.className = 'btn btn--outline btn--pill';
      see.href = previewLinks.payment;
      see.target = '_blank';
      see.rel = 'noopener';
      see.textContent = 'See the payment page';
      note.appendChild(see);
    }
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn btn--primary btn--pill';
    close.textContent = 'Close';
    close.addEventListener('click', closeForm);
    note.appendChild(close);
    form.hidden = true;
    form.parentNode.insertBefore(note, form.nextSibling);
    dlg.scrollTop = 0;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fail.hidden = true;

    var firstBad = null;
    fields.forEach(function (f) {
      var p = problem(f);
      show(f, p);
      if (p && !firstBad) firstBad = f;
    });
    if (firstBad) {
      control(firstBad).focus({ preventScroll: true });
      firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    var data = new FormData(form);
    var body = new URLSearchParams();
    data.forEach(function (value, key) { body.append(key, typeof value === 'string' ? value.trim() : value); });

    setBusy(true);

    if (document.body.hasAttribute('data-form-preview')) { previewDone(); return; }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      var q = new URLSearchParams({
        programme: body.get('programme') || '',
        name: body.get('first-name') || '',
        amount: body.get('amount') || '',
        t: String(Date.now())                       /* when the form was sent: the payment page counts its 30 minutes from here */
      });
      window.location.href = '/payment?' + q.toString();
    }).catch(function () {
      setBusy(false);
      fail.hidden = false;
      fail.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  });
})();

/* Payment page (/payment) ------------------------------------------------------------------------
   The registration form opens this page with three details in the address: ?programme=...&name=...&amount=...
   They are only DISPLAYED (with textContent, never as HTML). White checks every payment itself before giving access.
   Missing details keep the plain wording already in the HTML. The account number copy button lives here too. */
(function () {
  'use strict';
  if (!document.body.hasAttribute('data-pay-page')) return;

  var params = new URLSearchParams(window.location.search);

  /* Previews (build_preview.py) have no address details: show an example so the page can be judged */
  if (document.body.hasAttribute('data-form-preview') && !params.has('amount')) {
    params = new URLSearchParams({ programme: 'Piriformis Syndrome', name: 'Ada', amount: '15000', t: String(Date.now()) });
  }

  function clean(v, max) { return (v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var programme = clean(params.get('programme'), 60);
  var name = clean(params.get('name'), 30);
  var rawAmount = clean(params.get('amount'), 12);
  var amount = /^\d{3,8}$/.test(rawAmount) ? parseInt(rawAmount, 10) : 0;
  var money = amount ? '\u20A6' + amount.toLocaleString('en-US') : '';
  var programmeLine = programme ? '30-day ' + programme + ' programme' : '';

  if (name) all('[data-pay-hello]').forEach(function (el) { el.textContent = 'Thank you, ' + name + '.'; });
  if (money) all('[data-pay-amount]').forEach(function (el) { el.textContent = money; });
  if (programmeLine) all('[data-pay-programme]').forEach(function (el) { el.textContent = programmeLine; });

  /* WhatsApp message for the receipt, with the visitor's details when we have them */
  var receipt = document.querySelector('[data-pay-receipt]');
  var number = (window.WHITE_SITE && window.WHITE_SITE.whatsappNumber) || '2349029839464';
  if (receipt && (name || money || programmeLine)) {
    var msg = 'Hello White Physiotherapy, this is ' + (name || 'a new participant') + '. I have paid ' +
      (money || 'my fee') + ' for the ' + (programmeLine || '30-day programme') + '. Here is my receipt.';
    receipt.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(msg);
  }

  /* 30-minute hold: counted from the time the form was sent (t in the address), so a refresh does not restart it.
     Display only. At zero nothing is locked: the wording changes and asks the visitor to message us. */
  var HOLD_MINUTES = 30;
  var rawT = clean(params.get('t'), 14);
  var holdEls = all('[data-hold]');
  if (holdEls.length && /^\d{12,14}$/.test(rawT)) {
    var deadline = Math.min(parseInt(rawT, 10), Date.now()) + HOLD_MINUTES * 60 * 1000;   /* never later than now + 30 minutes */
    var clocks = all('[data-hold-time]');
    var timerId = 0;

    var showClock = function (leftMs) {
      var total = Math.max(0, Math.ceil(leftMs / 1000));
      var mm = Math.floor(total / 60);
      var ss = total % 60;
      var text = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
      clocks.forEach(function (el) { el.textContent = text; });
    };
    var expire = function () {
      window.clearInterval(timerId);
      holdEls.forEach(function (el) { el.classList.add('is-over'); });
      all('[data-hold-text]').forEach(function (el) { el.textContent = 'Your 30 minutes are up. Message us on WhatsApp and we will help.'; });
      all('[data-hold-title]').forEach(function (el) { el.textContent = 'Your 30 minutes are up'; });
      all('[data-hold-body]').forEach(function (el) { el.textContent = 'Please message us on WhatsApp and we will help you finish your registration.'; });
    };
    var tick = function () {
      var left = deadline - Date.now();
      if (left <= 0) { expire(); return; }
      showClock(left);
    };

    holdEls.forEach(function (el) { el.hidden = false; });
    tick();
    if (deadline - Date.now() > 0) {
      timerId = window.setInterval(tick, 1000);
      document.addEventListener('visibilitychange', tick);           /* catch up straight away when the tab or app comes back */
    }
  }

  /* Copy the account number */
  var copy = document.querySelector('[data-copy]');
  if (copy) {
    var label = copy.querySelector('.pay-copy__text');
    var timer;
    var flash = function (ok) {
      label.textContent = ok ? 'Copied' : 'Copy failed';
      copy.classList.toggle('is-copied', ok);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { label.textContent = 'Copy'; copy.classList.remove('is-copied'); }, 2200);
    };
    var fallback = function (text) {
      var box = document.createElement('textarea');
      box.value = text;
      box.setAttribute('readonly', '');
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(box);
      flash(ok);
    };
    copy.addEventListener('click', function () {
      var text = copy.getAttribute('data-copy');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { flash(true); }, function () { fallback(text); });
      } else {
        fallback(text);
      }
    });
  }
})();

