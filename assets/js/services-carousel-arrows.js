/* Services carousel (home page): proper side arrows on desktop.
   Elementor renders its arrows inside .swiper-wrapper, so they get dragged
   around by the slider transform and end up floating under the cards. These are
   plain buttons attached to the widget itself and wired to the same Swiper. */
(function () {
  var SVG_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 3.5 7 12l8.5 8.5 1.6-1.6L10.2 12l6.9-6.9z"/></svg>';
  var SVG_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 3.5 17 12l-8.5 8.5-1.6-1.6L13.8 12 6.9 5.1z"/></svg>';

  function init() {
    var car = document.querySelector('.e-n-carousel');
    if (!car) return true;                 // no carousel on this page
    if (!car.swiper) return false;         // wait for Elementor to boot Swiper
    if (!car.querySelector('.trx-addons-info-box-title')) return true; // not the services one

    var widget = car.closest('.elementor-element-c266de1') || car.parentElement;
    if (!widget || widget.dataset.hmArrows === '1') return true;
    widget.dataset.hmArrows = '1';

    function make(kind, label, svg) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hm-car-arrow hm-car-' + kind;
      b.setAttribute('aria-label', label);
      b.innerHTML = svg;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (car.swiper) {
          if (kind === 'prev') car.swiper.slidePrev(); else car.swiper.slideNext();
        }
      });
      return b;
    }

    widget.appendChild(make('prev', 'Previous services', SVG_PREV));
    widget.appendChild(make('next', 'Next services', SVG_NEXT));
    widget.classList.add('hm-car-ready');
    return true;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (init() || tries > 60) clearInterval(timer);
  }, 200);
  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);
})();
