/* Consentimiento de cookies y eventos de medición — Tech Advisors L.A. */
(function () {
    'use strict';
    var KEY = 'ta_consent';
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ } }
    function apply(v) {
        gtag('consent', 'update', {
            analytics_storage: v === 'granted' ? 'granted' : 'denied',
            ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
        });
        window.dataLayer.push({ event: 'consentimiento_actualizado', consentimiento: v });
    }

    /* ---------- aviso de cookies ---------- */
    var banner;
    function close() { if (banner) { banner.remove(); banner = null; } }
    function choose(v) { save(v); apply(v); close(); var st = document.querySelector('[data-ck-estado]'); if (st) st.textContent = label(v); }
    function label(v) { return v === 'granted' ? 'Usted aceptó las cookies de medición.' : v === 'denied' ? 'Usted rechazó las cookies de medición.' : 'Aún no ha elegido.'; }
    function open() {
        if (banner) return;
        banner = document.createElement('div');
        banner.className = 'ck-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML = '<p>Usamos cookies de medición de Google para saber qué páginas le resultan útiles. Solo se activan si usted las acepta. ' +
            '<a href="privacidad.html#cookies">Más información</a></p>' +
            '<div class="ck-actions"><button type="button" class="ck-btn ck-no">Rechazar</button><button type="button" class="ck-btn ck-yes">Aceptar</button></div>';
        document.body.appendChild(banner);
        banner.querySelector('.ck-yes').addEventListener('click', function () { choose('granted'); });
        banner.querySelector('.ck-no').addEventListener('click', function () { choose('denied'); });
    }
    window.taCookies = { abrir: open };

    var saved = read();
    if (saved === 'granted' || saved === 'denied') { apply(saved); } else { document.addEventListener('DOMContentLoaded', open); }

    document.addEventListener('DOMContentLoaded', function () {
        var st = document.querySelector('[data-ck-estado]');
        if (st) st.textContent = label(read());
        document.querySelectorAll('[data-ck-abrir]').forEach(function (b) {
            b.addEventListener('click', function (e) { e.preventDefault(); open(); });
        });
    });

    /* ---------- eventos ---------- */
    function push(o) { o.pagina = location.pathname.split('/').pop() || 'index.html'; window.dataLayer.push(o); }
    function texto(a) { return (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (a) {
            var h = a.getAttribute('href') || '';
            if (h.indexOf('wa.me/') > -1 || h.indexOf('api.whatsapp.com') > -1) {
                var m = h.match(/wa\.me\/(\d+)/);
                push({ event: 'click_whatsapp', destino: m ? (m[1] === '50683835646' ? 'mario' : 'eric') : 'otro', boton: texto(a) });
            } else if (h.indexOf('mailto:') === 0) {
                push({ event: 'click_correo', destino: h.replace('mailto:', '').split('?')[0].split('@')[0], boton: texto(a) });
            } else if (h.indexOf('tel:') === 0) {
                push({ event: 'click_telefono', boton: texto(a) });
            } else if (/(^|\/)contacto\.html/.test(h) && a.matches('.cta-button, .nav-cta')) {
                push({ event: 'click_cta_contacto', boton: texto(a) });
            }
            return;
        }
        var tab = e.target.closest && e.target.closest('.ts-tab');
        if (tab) { push({ event: 'ver_tema', tema: texto(tab) }); }
    });
})();
