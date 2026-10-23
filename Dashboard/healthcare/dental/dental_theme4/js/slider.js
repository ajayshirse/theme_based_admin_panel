/* Accessible testimonial slider: buttons, dots, swipe, keyboard, autoplay */
(function () {
  'use strict';
  function initSlider(root) {
    var viewport = root.querySelector('.slider-viewport');
    var track = root.querySelector('.slider-track');
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    var dotsBox = root.querySelector('.dots');
    var live = root.querySelector('[data-slider-live]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var toggle = root.querySelector('[data-slider-toggle]');
    var index = 0, perView = 1, timer = null, userPaused = false;

    function calcPerView() { return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1; }
    function maxIndex() { return Math.max(0, slides.length - perView); }

    function buildDots() {
      dotsBox.innerHTML = '';
      for (var i = 0; i <= maxIndex(); i++) {
        var d = document.createElement('button');
        d.type = 'button'; d.className = 'dot';
        d.setAttribute('aria-label', 'Show testimonials starting from ' + (i + 1));
        (function (n) { d.addEventListener('click', function () { go(n, true); }); })(i);
        dotsBox.appendChild(d);
      }
    }

    function render() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var w = slides[0].getBoundingClientRect().width;
      track.style.transform = 'translateX(' + (-index * (w + gap)) + 'px)';
      slides.forEach(function (s, i) {
        var visible = i >= index && i < index + perView;
        s.setAttribute('aria-hidden', String(!visible));
        s.querySelectorAll('a,button').forEach(function (el) { el.tabIndex = visible ? 0 : -1; });
      });
      Array.prototype.forEach.call(dotsBox.children, function (d, i) {
        if (i === index) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
      prev.disabled = index === 0;
      next.disabled = index === maxIndex();
    }

    function go(n, announce) {
      index = Math.min(Math.max(n, 0), maxIndex());
      render();
      if (announce && live) { live.textContent = 'Showing testimonial ' + (index + 1) + ' of ' + slides.length; }
    }

    function setup() {
      perView = calcPerView();
      root.style.setProperty('--per-view', perView);
      buildDots();
      go(Math.min(index, maxIndex()));
    }

    function play() {
      if (reduce || userPaused || timer) { return; }
      timer = setInterval(function () { go(index >= maxIndex() ? 0 : index + 1); }, 6000);
    }
    function stop() { clearInterval(timer); timer = null; }

    if (toggle) {
      if (reduce) { toggle.hidden = true; }
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        toggle.setAttribute('aria-pressed', String(userPaused));
        toggle.setAttribute('aria-label', userPaused ? 'Resume automatic sliding' : 'Pause automatic sliding');
        toggle.innerHTML = userPaused
          ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9z"/></svg>'
          : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
        userPaused ? stop() : play();
      });
    }
    prev.addEventListener('click', function () { go(index - 1, true); });
    next.addEventListener('click', function () { go(index + 1, true); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1, true); }
      if (e.key === 'ArrowRight') { go(index + 1, true); }
    });
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { root.addEventListener(ev, stop, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { root.addEventListener(ev, play); });

    var startX = null;
    viewport.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (startX === null) { return; }
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1), true); }
      startX = null;
    }, { passive: true });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setup, 120); });
    setup(); play();
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slider]').forEach(initSlider);
  });
})();
