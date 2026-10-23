/* Shared form validation helpers + contact form (demo only) */
(function () {
  'use strict';
  var C = (window.Curemax = window.Curemax || {});

  var rules = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address, for example name@example.com.'; },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      return (/^\+?[0-9\s\-()]+$/.test(v) && digits.length >= 7 && digits.length <= 15) || 'Enter a valid phone number (7–15 digits).';
    },
    name: function (v) { return v.trim().length >= 2 || 'Enter your full name (at least 2 characters).'; },
    date: function (v) {
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d)) { return 'Choose a valid date.'; }
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var max = new Date(today); max.setFullYear(max.getFullYear() + 1);
      if (d < today) { return 'Choose today or a future date.'; }
      if (d > max) { return 'Choose a date within the next 12 months.'; }
      if (d.getDay() === 0) { return 'The clinic is closed on Sundays. Choose Monday to Saturday.'; }
      return true;
    }
  };

  function errorEl(field) { return document.getElementById(field.id + '-error'); }

  function setError(field, message) {
    var el = errorEl(field);
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (el) { el.textContent = message; }
    } else {
      field.removeAttribute('aria-invalid');
      if (el) { el.textContent = ''; }
    }
  }

  function validateField(field) {
    var value = (field.value || '').trim();
    var label = field.getAttribute('data-label') || 'This field';
    if (field.required && !value) { setError(field, label + ' is required.'); return false; }
    if (!value) { setError(field, ''); return true; }
    var type = field.getAttribute('data-validate');
    if (type && rules[type]) {
      var result = rules[type](value);
      if (result !== true) { setError(field, result); return false; }
    }
    var min = parseInt(field.getAttribute('data-minlength'), 10);
    if (min && value.length < min) { setError(field, label + ' needs at least ' + min + ' characters.'); return false; }
    setError(field, '');
    return true;
  }

  function validateForm(form) {
    var fields = form.querySelectorAll('input, select, textarea');
    var firstInvalid = null;
    fields.forEach(function (f) {
      if (f.type === 'hidden' || f.type === 'submit') { return; }
      if (!validateField(f) && !firstInvalid) { firstInvalid = f; }
    });
    if (firstInvalid) { firstInvalid.focus(); }
    return !firstInvalid;
  }

  function showStatus(form, type, html) {
    var box = form.querySelector('.form-status');
    if (!box) { return; }
    box.className = 'form-status is-visible ' + type;
    box.innerHTML = html;
    box.focus();
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* options.onValid(form) returns HTML for the success message */
  C.initForm = function (form, onValid) {
    if (!form) { return; }
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('blur', function (e) {
      if (e.target.matches('input, select, textarea')) { validateField(e.target); }
    }, true);
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') { validateField(e.target); }
    });
    form.addEventListener('change', function (e) {
      if (e.target.matches('select, input[type="date"]')) { validateField(e.target); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = form.querySelector('.form-status');
      if (box) { box.className = 'form-status'; box.innerHTML = ''; }
      if (!validateForm(form)) {
        showStatus(form, 'error', '<strong>Please fix the highlighted fields.</strong> Each field with a problem has a message beneath it.');
        var firstBad = form.querySelector('[aria-invalid="true"]'); if (firstBad) { firstBad.focus(); }
        return;
      }
      showStatus(form, 'success', onValid(form));
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(function (f) { f.removeAttribute('aria-invalid'); });
      form.dispatchEvent(new CustomEvent('curemax:reset'));
    });
  };

  C.validation = { validateField: validateField, validateForm: validateForm, esc: esc };

  /* Contact form (demo) */
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    C.initForm(form, function (f) {
      var name = esc(f.elements.name.value.trim());
      return '<strong>Demo only: thanks, ' + name + '.</strong> This message was checked in your browser but not sent to anyone. ' +
        'Connect the form to a backend or form service to receive real enquiries.';
    });
  });
})();
