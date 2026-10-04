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

  /* Aparición al hacer scroll (una sola vez).
     .reveal entra en cuanto asoma; .draw (coreografías largas) espera a verse un tercio, para que se vea entera */
  var observe = function (selector, threshold) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.setAttribute('data-visible', ''); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.setAttribute('data-visible', ''); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: threshold });
    els.forEach(function (el) { io.observe(el); });
  };
  observe('.reveal', 0.08);
  observe('.draw', 0.3);

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

  /* Protección disuasoria de imágenes: sin menú contextual ni arrastre sobre las fotos */
  document.addEventListener('contextmenu', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var enBanner = t.closest('.banner') && !t.closest('a, button, input, select, textarea, h1, p, dt, dd');
    if (enBanner || t.closest('img, .banner__bg, .bigphoto')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });

  /* Reseñas de Google (Places API, en vivo). Si algo falla, el bloque simplemente no aparece. */
  var gsec = document.querySelector('[data-gplace]');
  if (gsec && 'fetch' in window) {
    var gDone = false;
    var seguro = function (u) { return typeof u === 'string' && /^https:\/\//i.test(u); };
    var mk = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    var STAR = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15l-5.3 3 1.1-6L1.4 7.8l6-.8z"/></svg>';
    var estrellas = function (n, tam) {
      var s = mk('span', 'stars'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', n + ' de 5 estrellas');
      var h = ''; for (var i = 0; i < 5; i++) h += (i < n ? STAR : STAR.replace('<svg ', '<svg style="opacity:.22" ')); s.innerHTML = h;
      if (tam) { var sv = s.querySelectorAll('svg'); for (var k = 0; k < sv.length; k++) { sv[k].setAttribute('width', tam); sv[k].setAttribute('height', tam); } }
      return s;
    };
    var render = function (d) {
      var lista = (d.reviews || []).filter(function (r) { return r && r.text && r.text.text; }).slice(0, 5);
      if (!lista.length) return;
      var cont = gsec.querySelector('[data-greviews]');
      lista.forEach(function (r, i) {
        var au = r.authorAttribution || {};
        var fig = mk('figure', 'review review--g'); fig.style.setProperty('--i', i);
        var head = mk('div', 'review__head');
        if (seguro(au.photoUri)) {
          var im = document.createElement('img'); im.className = 'review__avatar'; im.alt = ''; im.width = 44; im.height = 44; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer'; im.src = au.photoUri; head.appendChild(im);
        } else { head.appendChild(mk('span', 'review__avatar review__avatar--ini', (au.displayName || '?').charAt(0).toUpperCase())); }
        var quien = seguro(au.uri) ? mk('a', 'review__who') : mk('span', 'review__who');
        if (seguro(au.uri)) { quien.href = au.uri; quien.target = '_blank'; quien.rel = 'noopener nofollow'; }
        quien.appendChild(mk('span', 'review__name', au.displayName || 'Usuario de Google'));
        if (r.relativePublishTimeDescription) quien.appendChild(mk('span', 'review__time', r.relativePublishTimeDescription));
        head.appendChild(quien); fig.appendChild(head);
        fig.appendChild(estrellas(Math.max(1, Math.min(5, Math.round(r.rating || 5)))));
        var bq = mk('blockquote', null, r.text.text); fig.appendChild(bq);
        if (r.text.text.length > 210) {
          var b = mk('button', 'review__more', 'Leer más'); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
          b.addEventListener('click', function () { var abierto = bq.classList.toggle('is-open'); b.textContent = abierto ? 'Leer menos' : 'Leer más'; b.setAttribute('aria-expanded', abierto ? 'true' : 'false'); });
          fig.appendChild(b);
        }
        cont.appendChild(fig);
      });
      var sum = gsec.querySelector('[data-gsum]');
      if (d.rating && d.userRatingCount) {
        var nota = Number(d.rating); sum.appendChild(mk('strong', null, nota.toFixed(1).replace('.', ',')));
        sum.appendChild(estrellas(Math.round(nota), 20));
        sum.appendChild(mk('span', null, '· ' + Number(d.userRatingCount).toLocaleString('es-ES') + ' reseñas en Google'));
      } else { sum.hidden = true; }
      var enlace = gsec.querySelector('[data-glink]');
      if (seguro(d.googleMapsUri)) { enlace.href = d.googleMapsUri; enlace.hidden = false; }
      gsec.hidden = false;
      var n = 0; [].forEach.call(document.querySelectorAll('.eyebrow[data-n]'), function (e) { if (e.closest('[hidden]')) return; n++; e.setAttribute('data-n', (n < 10 ? '0' : '') + n); });
      var cerca = document.getElementById('t-cerca'), faq = document.getElementById('t-faq');
      if (cerca) cerca.closest('section').classList.remove('section--tint');
      if (faq) faq.closest('section').classList.add('section--tint');
    };
    var cargar = function () {
      if (gDone) return; gDone = true;
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 7000) : null;
      fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(gsec.getAttribute('data-gplace')) + '?languageCode=es', {
        headers: { 'X-Goog-Api-Key': gsec.getAttribute('data-gkey'), 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' },
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (d) { if (t) clearTimeout(t); render(d); })
        .catch(function () { /* sin reseñas: el bloque sigue oculto */ });
    };
    var antes = gsec.previousElementSibling;
    if ('IntersectionObserver' in window && antes) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); cargar(); } }, { rootMargin: '0px 0px 900px 0px' });
      io.observe(antes);
    } else { window.addEventListener('load', cargar); }
  }

  /* Año del pie */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
