/* Gallery lightbox + category filters (used by gallery and blog pages) */
(function () {
  'use strict';

  function initFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var target = document.querySelector(group.getAttribute('data-filter-group'));
      var empty = target && target.parentNode.querySelector('[data-filter-empty]');
      var buttons = group.querySelectorAll('[data-filter]');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var cat = btn.getAttribute('data-filter');
          buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
          var shown = 0;
          target.querySelectorAll('[data-category]').forEach(function (item) {
            var match = cat === 'all' || item.getAttribute('data-category') === cat;
            item.hidden = !match;
            if (match) { shown++; }
          });
          if (empty) { empty.hidden = shown !== 0; }
        });
      });
    });
  }

  function initLightbox() {
    var links = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
    if (!links.length) { return; }
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<button class="lb-btn lb-close" type="button" aria-label="Close image viewer"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Previous image"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Next image"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption');
    var closeBtn = box.querySelector('.lb-close');
    var current = 0, opener = null;

    function visibleLinks() { return links.filter(function (l) { return !l.closest('[hidden]'); }); }
    function show(i) {
      var list = visibleLinks();
      current = (i + list.length) % list.length;
      var a = list[current];
      img.src = a.getAttribute('href');
      img.alt = a.getAttribute('data-caption') || '';
      cap.textContent = (a.getAttribute('data-caption') || '') + '  (' + (current + 1) + ' / ' + list.length + ')';
    }
    function open(a) {
      opener = a;
      show(visibleLinks().indexOf(a));
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (opener) { opener.focus(); }
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
    });
    closeBtn.addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) { close(); } });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
      if (e.key === 'Tab') {
        var f = box.querySelectorAll('button'); var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () { initFilters(); initLightbox(); });
})();
