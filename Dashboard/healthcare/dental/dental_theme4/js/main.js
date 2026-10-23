/* Shared page behaviour: reveal, counters, FAQ, back-to-top, detail pages */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
      var start = null, dur = 1400;
      function step(t) {
        if (start === null) { start = t; }
        var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) { requestAnimationFrame(step); }
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initFaq() {
    document.querySelectorAll('[data-accordion]').forEach(function (acc) {
      var items = acc.querySelectorAll('.faq-item');
      items.forEach(function (item) {
        var btn = item.querySelector('.faq-q');
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') !== 'true';
          items.forEach(function (o) {
            var b = o.querySelector('.faq-q');
            b.setAttribute('aria-expanded', 'false'); o.classList.remove('is-open');
          });
          if (open) { btn.setAttribute('aria-expanded', 'true'); item.classList.add('is-open'); }
        });
      });
    });
  }

  function initBackToTop() {
    var btn = document.getElementById('to-top');
    if (!btn) { return; }
    var onScroll = function () { btn.classList.toggle('is-visible', window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  }

  /* Detail pages: show the item named in ?service= / ?doctor= / ?post= */
  function initDetailSwitcher() {
    var box = document.querySelector('[data-detail-switcher]');
    if (!box) { return; }
    var key = box.getAttribute('data-detail-switcher');
    var items = Array.prototype.slice.call(box.querySelectorAll('[data-detail-id]'));
    var wanted = new URLSearchParams(location.search).get(key);
    var active = items.filter(function (i) { return i.getAttribute('data-detail-id') === wanted; })[0] || items[0];
    items.forEach(function (i) { i.hidden = i !== active; });
    var title = active.getAttribute('data-title');
    document.querySelectorAll('[data-detail-heading],[data-detail-crumb]').forEach(function (n) { n.textContent = title; });
    document.title = title + ' | Curemax Dental';
    var id = active.getAttribute('data-detail-id');
    document.querySelectorAll('[data-detail-link]').forEach(function (a) {
      var current = a.getAttribute('data-detail-link') === id;
      a.classList.toggle('is-current', current);
      if (current) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }

  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDetailSwitcher(); initReveal(); initCounters(); initFaq(); initBackToTop(); initYear();
  });
})();
