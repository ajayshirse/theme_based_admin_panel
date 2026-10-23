/* Header: sticky shadow, dropdowns, mobile menu, active link highlighting */
(function () {
  'use strict';

  function currentFile() {
    var f = location.pathname.split('/').pop();
    return f || 'index.html';
  }

  function setActive() {
    var file = currentFile();
    var query = location.search;
    document.querySelectorAll('[data-nav] a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(href)) { return; }
      var parts = href.split('#')[0].split('?');
      if (parts[0] !== file) { return; }
      if (parts[1] && ('?' + parts[1]) !== query && !(query === '' && a.hasAttribute('data-default'))) { return; }
      if (href.indexOf('#') > -1) { return; }
      a.setAttribute('aria-current', 'page');
    });
    document.querySelectorAll('[data-nav] [data-pages]').forEach(function (item) {
      var pages = item.getAttribute('data-pages').split(' ');
      if (pages.indexOf(file) > -1) {
        var trigger = item.querySelector(':scope > .nav-link, :scope > .m-link');
        if (trigger) { trigger.classList.add('is-active'); }
      }
    });
  }

  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) { return; }
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initDropdowns() {
    var items = document.querySelectorAll('.nav-desktop .nav-item');
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)');
    function close(item) {
      var btn = item.querySelector(':scope > .nav-link');
      var menu = item.querySelector(':scope > .dropdown');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); }
      if (menu) { menu.classList.remove('is-open'); }
    }
    function open(item) {
      items.forEach(function (o) { if (o !== item) { close(o); } });
      var btn = item.querySelector(':scope > .nav-link');
      var menu = item.querySelector(':scope > .dropdown');
      if (btn) { btn.setAttribute('aria-expanded', 'true'); }
      if (menu) { menu.classList.add('is-open'); }
    }
    items.forEach(function (item) {
      var btn = item.querySelector(':scope > .nav-link');
      if (!btn || !item.querySelector(':scope > .dropdown')) { return; }
      btn.addEventListener('click', function (e) {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        /* A mouse click on a menu that hover just opened should keep it open */
        if (isOpen && e.detail > 0 && canHover.matches) { return; }
        isOpen ? close(item) : open(item);
      });
      item.addEventListener('mouseenter', function () { if (canHover.matches) { open(item); } });
      item.addEventListener('mouseleave', function () { if (canHover.matches) { close(item); } });
      item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) { close(item); } });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(item); btn.focus(); }
        if (e.key === 'ArrowDown' && document.activeElement === btn) {
          e.preventDefault(); open(item);
          var first = item.querySelector('.dropdown a'); if (first) { first.focus(); }
        }
      });
    });
    document.addEventListener('click', function (e) {
      items.forEach(function (item) { if (!item.contains(e.target)) { close(item); } });
    });
  }

  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var panel = document.getElementById('mobile-panel');
    var overlay = document.getElementById('mobile-overlay');
    var closeBtn = document.getElementById('menu-close');
    if (!toggle || !panel || !overlay) { return; }

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if (open) { closeBtn.focus(); } else { toggle.focus({ preventScroll: true }); }
    }
    toggle.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    overlay.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (!panel.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll('a[href], button:not([disabled])');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    panel.querySelectorAll('.m-link[aria-controls]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = document.getElementById(btn.getAttribute('aria-controls'));
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        sub.classList.toggle('is-open', open);
      });
    });
    panel.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (a.getAttribute('href').indexOf('#') > -1 || a.getAttribute('href') === currentFile()) { setOpen(false); }
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1280 && panel.classList.contains('is-open')) { setOpen(false); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActive(); initHeaderShadow(); initDropdowns(); initMobileMenu();
  });
})();
