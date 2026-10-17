/* Our Work — click any gallery photo to open it full-screen.
   Dependency-free. Keys: Esc closes, ←/→ browse. */
(function () {
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.hm-work-grid img'));
  if (!imgs.length) return;

  var ov = document.createElement('div');
  ov.className = 'hm-lightbox';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Project photo viewer');
  ov.innerHTML =
    '<button class="hm-lb-btn hm-lb-prev" type="button" aria-label="Previous photo">\u2039</button>' +
    '<figure class="hm-lb-figure">' +
      '<img class="hm-lb-img" alt="">' +
      '<figcaption class="hm-lb-cap"></figcaption>' +
    '</figure>' +
    '<button class="hm-lb-btn hm-lb-next" type="button" aria-label="Next photo">\u203a</button>' +
    '<button class="hm-lb-close" type="button" aria-label="Close">&times;</button>';
  document.body.appendChild(ov);

  var big = ov.querySelector('.hm-lb-img');
  var cap = ov.querySelector('.hm-lb-cap');
  var idx = 0;
  var count = imgs.length;

  function show(i) {
    idx = (i + count) % count;
    var img = imgs[idx];
    big.src = img.getAttribute('data-full') || img.currentSrc || img.src;
    big.alt = img.alt || '';
    cap.textContent = img.alt || '';
    ov.classList.add('is-open');
    document.body.classList.add('hm-lb-lock');
    ov.querySelector('.hm-lb-close').focus({ preventScroll: true });
  }

  function close() {
    ov.classList.remove('is-open');
    document.body.classList.remove('hm-lb-lock');
    big.removeAttribute('src');
  }

  imgs.forEach(function (img, i) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { show(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
    });
  });

  ov.querySelector('.hm-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  ov.querySelector('.hm-lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  ov.querySelector('.hm-lb-close').addEventListener('click', close);
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

  document.addEventListener('keydown', function (e) {
    if (!ov.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
