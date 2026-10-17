/* "Have enquiries? Reach out to us!" contact form.
   The Elementor form posted to the old WordPress install's admin-ajax.php, which
   this static site no longer has, so queries went nowhere. This intercepts the
   submit, validates, and posts the enquiry to the Netlify form 'contact-query'
   (Site settings > Forms), with a phone/email fallback if that fails. */
(function () {
  var forms = Array.prototype.slice.call(document.querySelectorAll('form.elementor-form'))
    .filter(function (f) { return f.querySelector('#form-field-email'); });
  if (!forms.length) return;

  var PHONE = '0203 105 1145';
  var EMAIL = 'info@hmlocksmithandsecurity.co.uk';

  forms.forEach(function (form) {
    var name = form.querySelector('#form-field-name');
    var email = form.querySelector('#form-field-email');
    var phone = form.querySelector('#form-field-field_26071b3') ||
                form.querySelector('#form-field-field_5452d44') ||
                form.querySelector('input[type="tel"]');
    var service = form.querySelector('#form-field-field_0f47d7d');
    var message = form.querySelector('#form-field-message');
    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.querySelector('.elementor-button-text') : null;
    var originalLabel = label ? label.textContent : '';

    var note = document.createElement('p');
    note.className = 'hm-book-msg hm-query-msg';
    note.setAttribute('role', 'status');
    note.hidden = true;
    form.parentNode.insertBefore(note, form.nextSibling);

    function say(text, ok) {
      note.innerHTML = text;
      note.hidden = false;
      note.classList.toggle('is-ok', !!ok);
      note.classList.toggle('is-err', !ok);
    }
    function mark(field, bad) {
      if (field) field.classList.toggle('hm-invalid', !!bad);
    }
    function val(el) { return el && el.value ? el.value.trim() : ''; }

    [name, email, phone, message].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { mark(f, false); });
    });

    form.addEventListener('submit', function (e) {
      /* stop Elementor's own handler: it posts to the dead admin-ajax endpoint */
      e.preventDefault();
      e.stopImmediatePropagation();

      var n = val(name), em = val(email), ph = val(phone), msg = val(message);
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
      var okPhone = ph.replace(/[^\d]/g, '').length >= 7;
      var okName = n.length >= 2;

      mark(name, !okName); mark(email, !okEmail); mark(phone, !okPhone);

      if (!okName || !okEmail || !okPhone) {
        say('Please check the highlighted fields — we need your name, a valid email and a contact number so we can reply.', false);
        (!okName ? name : (!okEmail ? email : phone)).focus();
        return;
      }

      var payload = {
        'form-name': 'contact-query',
        name: n,
        email: em,
        phone: ph,
        service: val(service) || 'Not specified',
        message: msg,
        page: location.pathname
      };

      if (button) button.disabled = true;
      if (label) label.textContent = 'Sending…';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        say('Thanks' + (n ? ', ' + n.split(' ')[0] : '') + ' — your enquiry is with us. '
          + 'We aim to reply within one working hour. For anything urgent call ' + PHONE + '.', true);
        form.reset();
      }).catch(function () {
        say('Sorry, the form could not send. Please email <a href="mailto:' + EMAIL + '">' + EMAIL
          + '</a> or call <a href="tel:02031051145">' + PHONE + '</a> and we will sort it straight away.', false);
      }).then(function () {
        if (button) button.disabled = false;
        if (label) label.textContent = originalLabel;
      });
    }, true);
  });
})();
