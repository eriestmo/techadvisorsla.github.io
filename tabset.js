/* Ruleta de contenido: pestañas con rotación automática suave.
   - Rota sola cada 14 s mientras la ruleta está a la vista; se detiene al pasar el mouse, al enfocar o al interactuar.
   - Se desactiva con "reducir movimiento". Sin JavaScript, todo el contenido se muestra completo. */
(function () {
  var sets = [].slice.call(document.querySelectorAll('[data-tabset]'));
  if (!sets.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var api = [];

  sets.forEach(function (set) {
    var panels = [].slice.call(set.querySelectorAll(':scope > .ts-panel'));
    var tabs = [].slice.call(set.querySelectorAll('.ts-tab'));
    var bar = set.querySelector('.ts-bar');
    var pauseBtn = set.querySelector('.ts-pause');
    var cur = 0, stopped = reduce, visible = false;
    set.classList.add('js');

    function sync() {
      set.classList.toggle('ts-auto', !stopped && visible);
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-label', stopped ? 'Reanudar rotación automática' : 'Pausar rotación automática');
        set.classList.toggle('ts-stopped', stopped);
      }
    }
    function go(n, user) {
      cur = (n + panels.length) % panels.length;
      panels.forEach(function (p, k) { p.classList.toggle('is-active', k === cur); });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === cur)); t.tabIndex = k === cur ? 0 : -1; });
      var t = tabs[cur];
      if (t && t.scrollIntoView && bar) {
        var tt = t.parentNode; tt.scrollTo({ left: t.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (user) {
        stopped = true; sync();
        var r = bar.getBoundingClientRect();
        if (r.top < 90 || r.top > window.innerHeight * 0.6) bar.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      } else { sync(); }
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { go(k, true); }); });
    var prev = set.querySelector('.ts-prev'), next = set.querySelector('.ts-next');
    if (prev) prev.addEventListener('click', function () { go(cur - 1, true); });
    if (next) next.addEventListener('click', function () { go(cur + 1, true); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { stopped = !stopped; sync(); });
    set.querySelector('.ts-tabs').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1), true); tabs[cur].focus();
    });
    set.addEventListener('animationend', function (e) { if (e.animationName === 'tsfill' && !stopped) go(cur + 1, false); });
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { set.addEventListener(ev, function () { set.classList.add('ts-hold'); }, { passive: true }); });
    ['mouseleave', 'focusout', 'touchend'].forEach(function (ev) { set.addEventListener(ev, function () { set.classList.remove('ts-hold'); }, { passive: true }); });
    var x0 = null;
    set.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    set.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 70 && e.target.closest && !e.target.closest('.ts-tabs')) go(cur + (dx < 0 ? 1 : -1), true);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(set);
    } else { visible = true; }
    api.push({ set: set, panels: panels, go: go });
    go(0, false);
  });

  // Enlaces internos (#id) que apuntan a una pestaña que no está visible
  function reveal(hash, smooth) {
    if (!hash || hash.length < 2) return;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    api.forEach(function (a) {
      a.panels.forEach(function (p, k) {
        if (p === el || p.contains(el)) {
          a.go(k, true);
          setTimeout(function () { el.scrollIntoView({ block: 'start', behavior: smooth && !reduce ? 'smooth' : 'auto' }); }, 30);
        }
      });
    });
  }
  window.addEventListener('hashchange', function () { reveal(location.hash, true); });
  if (location.hash) setTimeout(function () { reveal(location.hash, false); }, 60);
})();
