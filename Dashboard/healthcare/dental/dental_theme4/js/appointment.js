/* Appointment form: date limits, Saturday hours, prefill from URL, demo submit */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('appointment-form');
    if (!form) { return; }
    var C = window.Curemax;
    var date = form.elements.date;
    var time = form.elements.time;

    function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    var today = new Date(), max = new Date(); max.setFullYear(max.getFullYear() + 1);
    date.min = iso(today); date.max = iso(max);

    function syncTimes() {
      var d = date.value ? new Date(date.value + 'T00:00:00') : null;
      var saturday = d && d.getDay() === 6;
      Array.prototype.forEach.call(time.options, function (o) {
        var afternoon = o.hasAttribute('data-weekday-only');
        o.hidden = !!(saturday && afternoon);
        o.disabled = !!(saturday && afternoon);
      });
      if (time.selectedOptions[0] && time.selectedOptions[0].disabled) { time.value = ''; }
    }
    date.addEventListener('change', syncTimes);
    form.addEventListener('curemax:reset', syncTimes);

    var params = new URLSearchParams(location.search);
    ['doctor', 'service'].forEach(function (key) {
      var v = params.get(key);
      if (v && form.elements[key] && form.elements[key].querySelector('option[value="' + CSS.escape(v) + '"]')) { form.elements[key].value = v; }
    });

    C.initForm(form, function (f) {
      function label(sel) { return C.validation.esc(sel.options[sel.selectedIndex].text); }
      var when = new Date(f.elements.date.value + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return '<strong>Demo only: your request was checked but not sent.</strong> No appointment has been booked and no email has been sent. ' +
        'Request details: ' + C.validation.esc(f.elements.name.value.trim()) + ', ' + label(f.elements.service) + ' with ' + label(f.elements.doctor) +
        ', ' + C.validation.esc(when) + ' at ' + label(f.elements.time) + '. Connect this form to a backend or booking service to take real bookings.';
    });
  });
})();
