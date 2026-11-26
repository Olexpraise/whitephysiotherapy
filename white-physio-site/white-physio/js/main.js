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
   Usage: <div class="video-card" data-video-key="some-key"> looks up its YouTube link in
   window.WHITE_VIDEOS (one file: js/videos.js — the only file to touch when a new video arrives).
   A card can also carry data-video-id="..." directly, which wins over data-video-key if both are set.
   With no link either way the card shows as "Video coming soon". With a link it shows the real
   YouTube thumbnail and loads the player only when tapped, which keeps the page fast.
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

  function rawFor(card) {
    var direct = card.getAttribute('data-video-id');
    if (direct) return direct;
    var key = card.getAttribute('data-video-key');
    return key && window.WHITE_VIDEOS ? (window.WHITE_VIDEOS[key] || '') : '';
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
    var id = parseId(rawFor(card));
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

  var hasQuiz = !!document.getElementById('book');
  Array.prototype.forEach.call(document.querySelectorAll('a[data-wa]'), function (link) {
    /* A button with no value opens the booking dialog (js/booking.js). Point it at #book (not WhatsApp) so it still
       works if the click handler is bypassed, e.g. in an in-app viewer. The dialog itself offers WhatsApp. */
    if (hasQuiz && !link.getAttribute('data-wa')) {
      link.setAttribute('href', '#book');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      return;
    }
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


