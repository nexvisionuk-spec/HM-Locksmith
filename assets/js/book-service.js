/* "Book A Service Now" bar on the home page.
   The Elementor form used to post to the WordPress admin-ajax endpoint, which
   does not exist on this static build, so the button did nothing.
   Now: validate, record the lead (Netlify Forms) and hand off to WhatsApp with
   the service + postcode pre-filled, with a phone fallback. */
(function () {
  var service = document.getElementById('form-field-field_62fdbea');
  if (!service) return;
  var form = service.closest('form');
  if (!form) return;

  var postcode = document.getElementById('form-field-field_e38bc1d');
  var button = form.querySelector('button[type="submit"]');
  var label = button ? button.querySelector('.elementor-button-text') : null;

  var WHATSAPP = '447956128990';
  var PHONE = '0203 105 1145';

  var msg = document.createElement('p');
  msg.className = 'hm-book-msg';
  msg.setAttribute('role', 'status');
  msg.hidden = true;
  form.parentNode.insertBefore(msg, form.nextSibling);

  function say(text, ok) {
    msg.textContent = text;
    msg.hidden = false;
    msg.classList.toggle('is-ok', !!ok);
    msg.classList.toggle('is-err', !ok);
  }

  function mark(field, bad) {
    if (field) field.classList.toggle('hm-invalid', !!bad);
  }

  [service, postcode].forEach(function (f) {
    if (!f) return;
    f.addEventListener('input', function () { mark(f, false); });
    f.addEventListener('change', function () { mark(f, false); });
  });

  function record(payload) {
    try {
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString()
      }).catch(function () {});
    } catch (e) { /* offline / blocked: the WhatsApp handoff still works */ }
  }

  form.addEventListener('submit', function (e) {
    /* Elementor's own handler also listens for submit and posts to the
       WordPress admin-ajax endpoint. That endpoint does not exist here, so it
       fails and prints a red "error" line inside the form. Stop it before it
       runs (capture phase) so only this handler deals with the submit. */
    e.preventDefault();
    e.stopImmediatePropagation();

    var chosen = (service.value || '').trim();
    var pc = (postcode && postcode.value ? postcode.value : '').trim();
    var firstOption = service.options.length ? service.options[0].value : '';
    var serviceOk = !!chosen && chosen !== firstOption;
    var pcOk = pc.replace(/\s+/g, '').length >= 3;

    mark(service, !serviceOk);
    mark(postcode, !pcOk);

    if (!serviceOk || !pcOk) {
      say(!serviceOk && !pcOk
        ? 'Please choose a service and add your postcode.'
        : (!serviceOk ? 'Please choose the service you need.' : 'Please add your postcode so we know where to send the team.'), false);
      (!serviceOk ? service : postcode).focus();
      return;
    }

    var text = 'Hi H&M Group, I would like to book a service.\n'
      + 'Service: ' + chosen + '\n'
      + 'Postcode: ' + pc.toUpperCase() + '\n'
      + 'Sent from the website';
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);

    record({
      'form-name': 'book-service',
      service: chosen,
      postcode: pc.toUpperCase(),
      page: location.pathname
    });

    var opened = null;
    try { opened = window.open(url, '_blank', 'noopener'); } catch (err) { opened = null; }
    if (!opened) { location.href = url; }

    if (button) {
      button.disabled = true;
      if (label) label.textContent = 'Opening WhatsApp…';
      setTimeout(function () {
        button.disabled = false;
        if (label) label.textContent = 'Book Us Now';
      }, 2600);
    }

    say('Thanks! WhatsApp should have opened with your request filled in — just press send. '
      + 'If it did not open, call us on ' + PHONE + '.', true);
  }, true);
})();
