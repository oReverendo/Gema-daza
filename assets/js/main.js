(function () {
  'use strict';
  var doc = document.documentElement;

  /* Header: sombra ao rolar */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.setAttribute('data-scrolled', '');
      else header.removeAttribute('data-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Menú móvil */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (open) nav.setAttribute('data-open', ''); else nav.removeAttribute('data-open');
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  /* Aparición al hacer scroll (una sola vez) */
  var items = document.querySelectorAll('.reveal, .draw');
  if (items.length) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.setAttribute('data-visible', ''); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      items.forEach(function (el) { io.observe(el); });
    }
  }

  /* Formulario de contacto: prepara el mensaje y abre WhatsApp (no se guarda nada) */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.nombre.value.trim();
      var topic = form.elements.motivo.value;
      var msg = form.elements.mensaje.value.trim();
      var text = 'Hola Gema, soy ' + name + '.' + (topic ? ' Te escribo por: ' + topic + '.' : '') + (msg ? ' ' + msg : '');
      var wa = form.getAttribute('data-wa');
      var mail = form.getAttribute('data-mail');
      var url;
      if (wa) url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
      else if (mail) url = 'mailto:' + mail + '?subject=' + encodeURIComponent('Consulta de extranjería') + '&body=' + encodeURIComponent(text);
      else { alert('Aún no hay un número de contacto configurado.'); return; }
      window.open(url, '_blank', 'noopener');
    });
  }

  /* Año del pie */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
