/* =====================================================================
   script.js — behaviour only. Content comes from js/data.js.
   0 Setup   1 Render data   2 Split text   3 Scene engine   4 Nav
   5 Projects   6 Timeline controls   7 Case panel   8 Cursor   9 Form
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- 0. SETUP ---------- */
  const root = document.documentElement;
  root.classList.add('js'); // if this file fails to load, nothing stays hidden

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SITE = window.SITE || {};
  const links = SITE.links || {};
  const images = SITE.images || {};
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- 1. RENDER DATA ---------- */
  $$('[data-link]').forEach((a) => { if (links[a.dataset.link]) a.href = links[a.dataset.link]; });
  if (links.email) $('#email-row').innerHTML = `<a href="mailto:${esc(links.email)}">${esc(links.email)} <svg aria-hidden="true"><use href="#i-ur"/></svg></a>`;
  $('#year').textContent = new Date().getFullYear();

  // Image paths from data.js
  const setSrc = (sel, v) => { const el = $(sel); if (el && v) el.src = v; };
  setSrc('#portrait-img', images.portrait); setSrc('#img-about', images.about);
  setSrc('#img-terminal', images.terminal); setSrc('#img-skills', images.skills);

  // Portrait: show a monogram until the photo exists
  const portrait = $('#portrait'), pimg = $('#portrait-img');
  const noPhoto = () => portrait.classList.add('no-photo');
  pimg.addEventListener('error', noPhoto);
  if (pimg.complete && pimg.naturalWidth === 0) noPhoto();

  // Timeline + achievements
  $('#timeline').innerHTML = (SITE.timeline || []).map((t, i) => `
    <li class="step ${t.type === 'award' ? 'step--award' : ''}" data-in style="--d:${i + 2}">
      <span class="step__when">${esc(t.when)}</span><span class="step__node" aria-hidden="true"></span>
      <h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>
    </li>`).join('');
  $('#achievements').innerHTML = (SITE.achievements || []).map((a, i) => `
    <div class="ach" data-in style="--d:${(SITE.timeline || []).length + 2 + i}">
      <div class="ach__mark" aria-hidden="true">${esc(a.mark)}</div>
      <h3>${esc(a.title)}</h3><p class="ach__event">${esc(a.event)}</p><p class="ach__text">${esc(a.text)}</p>
      ${a.proof ? `<a class="ach__proof" href="${esc(a.proof)}" target="_blank" rel="noopener noreferrer">View proof</a>` : ''}
    </div>`).join('');

  // Skills
  const { current = [], learning = [] } = SITE.skills || {};
  $('#skills-using').innerHTML = current.map((s, i) => `<li data-in style="--d:${i + 2}">${esc(s.name)}</li>`).join('');
  $('#skills-learning').innerHTML = learning.map((s, i) => `<li data-in style="--d:${i + 3}">${esc(s.name)}</li>`).join('');

  /* ---------- 2. SPLIT TEXT (headline reveal) ---------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim(), chars = el.dataset.split === 'char';
    el.setAttribute('aria-label', text); el.textContent = '';
    let k = 0;
    text.split(/\s+/).forEach((word, wi, all) => {
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      (chars ? [...word] : [word]).forEach((part) => {
        const m = document.createElement('span'); m.className = 'm';
        const i = document.createElement('span'); i.className = 'i'; i.textContent = part; i.style.setProperty('--k', k++);
        m.appendChild(i); w.appendChild(m);
      });
      el.appendChild(w);
      if (wi < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- 3. SCENE ENGINE ---------- */
  const scenes = $$('.scene');
  const ids = scenes.map((s) => s.id);
  const navAnchors = $$('#nav-links a');
  const navEl = $('#nav');
  const hint = $('#hint');
  const canDeck = matchMedia('(min-width: 900px) and (min-height: 640px)');
  let deckOn = false, cur = -1, busy = false, lockUntil = 0;

  // The custom cursor only exists in scene mode, and is switched off while the case panel is open
  // (the panel sits above everything, so the real cursor must come back there).
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion;
  const syncCursor = () => root.classList.toggle('has-cursor', finePointer && deckOn && !$('dialog[open]'));

  const setNav = (id) => navAnchors.forEach((a) => {
    const on = a.getAttribute('href') === '#' + id;
    a.classList.toggle('is-active', on);
    on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
  });

  // Move to scene i with a circular wipe that starts at (x, y) in screen pixels
  function go(i, { x, y, instant = false } = {}) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    if (i === cur) return;
    if (!instant && (busy || performance.now() < lockUntil)) return;
    const next = scenes[i], prev = scenes[cur], dir = i > cur ? 1 : -1;
    next.style.setProperty('--cx', x != null ? (x / innerWidth * 100).toFixed(1) + '%' : '50%');
    next.style.setProperty('--cy', y != null ? (y / innerHeight * 100).toFixed(1) + '%' : (dir > 0 ? '100%' : '0%'));
    scenes.forEach((s) => s.classList.remove('is-below'));
    if (prev) { prev.classList.remove('is-active'); prev.classList.add('is-below'); }
    next.classList.toggle('is-instant', instant);
    next.classList.add('is-active');
    cur = i;
    root.dataset.tone = next.dataset.tone === 'dark' ? 'dark' : 'light';
    setNav(next.id);
    history.replaceState(null, '', '#' + next.id);
    if (!instant) {
      hint.classList.add('is-gone');
      busy = true; lockUntil = performance.now() + 1500;
      setTimeout(() => { if (prev) { prev.classList.remove('is-below'); prev.scrollTop = 0; } busy = false; }, 1100);
    }
    next.scrollTop = 0; navEl.classList.remove('is-solid');
  }
  const step = (d, o) => go(cur + d, o);

  // The contact scene is taller than the screen (it scrolls down to the footer)
  const sc = () => scenes[cur];
  const scrollable = () => { const s = sc(); return !!s && s.dataset.scroll === 'true' && s.scrollHeight > s.clientHeight + 2; };
  let lastInnerScroll = 0;
  scenes.forEach((s) => s.addEventListener('scroll', () => { lastInnerScroll = performance.now(); if (s === sc()) navEl.classList.toggle('is-solid', s.scrollTop > 8); }, { passive: true }));

  // Wheel / keys / touch (only in scene mode)
  let acc = 0, accTimer;
  addEventListener('wheel', (e) => {
    if (!deckOn || $('dialog[open]')) return;
    const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (horizontal && e.target.closest('.track')) return;            // sideways timeline scroll
    if (scrollable()) {
      const s = sc();
      if (e.deltaY > 0) return;                                      // scroll down to the footer
      if (e.deltaY < 0 && (s.scrollTop > 1 || performance.now() - lastInnerScroll < 350)) return; // scroll back up first
    }
    e.preventDefault();
    acc += e.deltaY; clearTimeout(accTimer); accTimer = setTimeout(() => { acc = 0; }, 160);
    // On the final scene, require a more intentional upward gesture at the very top.
    const threshold = (cur === scenes.length - 1 && sc() && sc().scrollTop <= 1 && e.deltaY < 0) ? 180 : 50;
    if (Math.abs(acc) > threshold) { step(Math.sign(acc)); acc = 0; }
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (!deckOn || $('dialog[open]') || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select, [role="tablist"]')) return;
    const s = sc(), inner = scrollable();
    const atBottom = () => s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (inner && !atBottom()) s.scrollBy({ top: e.key === 'PageDown' ? s.clientHeight * 0.8 : 120, behavior: 'smooth' }); else step(1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (inner && s.scrollTop > 1) s.scrollBy({ top: e.key === 'PageUp' ? -s.clientHeight * 0.8 : -120, behavior: 'smooth' }); else step(-1);
    } else if (e.key === 'Home') {
      e.preventDefault(); if (inner && s.scrollTop > 1) s.scrollTo({ top: 0, behavior: 'smooth' }); else go(0);
    } else if (e.key === 'End') {
      e.preventDefault(); if (cur === scenes.length - 1) s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); else go(scenes.length - 1);
    }
  });

  let ty = null, tTop = 0;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; tTop = sc() ? sc().scrollTop : 0; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (!deckOn || ty == null || e.target.closest('.track, dialog')) { ty = null; return; }
    const dy = ty - e.changedTouches[0].clientY; ty = null;
    if (Math.abs(dy) < 70) return;
    if (scrollable()) { if (dy > 0 || tTop > 1 || sc().scrollTop > 1) return; }
    step(Math.sign(dy));
  }, { passive: true });

  // In-page links: circular wipe from the click position
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !deckOn) return;
    const i = ids.indexOf(a.getAttribute('href').slice(1));
    if (i < 0) return;
    e.preventDefault(); go(i, { x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight / 2 });
  });
  addEventListener('hashchange', () => { if (deckOn) { const i = ids.indexOf(location.hash.slice(1)); if (i >= 0) go(i); } });

  // Normal-scroll mode: reveal scenes as they arrive + highlight nav
  const flowIO = new IntersectionObserver((entries) => {
    if (deckOn) return;
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('is-active'); });
  }, { threshold: 0.18 });
  // Glass header follows the colour of the section under it (also in normal-scroll mode)
  const toneIO = new IntersectionObserver((entries) => {
    if (deckOn) return;
    entries.forEach((en) => { if (en.isIntersecting) root.dataset.tone = en.target.dataset.tone === 'dark' ? 'dark' : 'light'; });
  }, { rootMargin: '0px 0px -90% 0px' });
  const spyIO = new IntersectionObserver((entries) => {
    if (deckOn) return;
    entries.forEach((en) => { if (en.isIntersecting) setNav(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });

  function setDeck(on) {
    if (on === deckOn && cur !== -1) return;
    deckOn = on; root.classList.toggle('deck-on', on); syncCursor();
    scenes.forEach((s) => { s.classList.remove('is-active', 'is-below', 'is-instant'); s.style.removeProperty('--cx'); s.style.removeProperty('--cy'); });
    flowIO.disconnect(); spyIO.disconnect(); toneIO.disconnect(); cur = -1;
    if (on) {
      const start = Math.max(0, ids.indexOf(location.hash.slice(1)));
      if (start > 0) hint.classList.add('is-gone');
      go(start, { instant: true });
    } else {
      root.removeAttribute('data-tone');
      navEl.classList.remove('is-solid');
      scenes.forEach((s) => { flowIO.observe(s); spyIO.observe(s); toneIO.observe(s); });
      const t = $(location.hash || 'body'); if (location.hash && t) t.scrollIntoView();
    }
  }
  const evalDeck = () => setDeck(canDeck.matches && !reduceMotion);
  canDeck.addEventListener('change', evalDeck);
  addEventListener('resize', () => { clearTimeout(evalDeck.t); evalDeck.t = setTimeout(evalDeck, 150); });
  evalDeck();

  /* ---------- 4. NAV (mobile menu) ---------- */
  const navLinks = $('#nav-links'), toggle = $('#menu-toggle');
  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 5. PROJECTS (list + big circle image) ---------- */
  const projects = SITE.projects || [];
  const tabs = $('#work-tabs'), detail = $('#work-detail'), imgs = $('#work-imgs');
  let sel = 0;
  tabs.innerHTML = projects.map((p, i) => `
    <button class="tab" role="tab" type="button" data-i="${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <span class="tab__n">0${i + 1}</span><span>${esc(p.short || p.title)}</span>
    </button>`).join('');
  imgs.innerHTML = projects.map((p, i) => `<img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" class="${i === 0 ? 'is-on' : ''}">`).join('');

  function showProject(i, animate = true) {
    const p = projects[i]; if (!p) return;
    sel = i;
    $$('.tab', tabs).forEach((t, n) => { t.setAttribute('aria-selected', String(n === i)); t.tabIndex = n === i ? 0 : -1; });
    $$('img', imgs).forEach((im, n) => im.classList.toggle('is-on', n === i));
    detail.innerHTML = `
      ${p.badge ? `<p class="badge">${esc(p.badge)}</p>` : '<span></span>'}
      <p class="detail__kicker">${esc(p.kicker)}</p>
      <p class="detail__summary">${esc(p.summary)}</p>
      <ul class="tags" aria-label="Technologies used">${(p.tags || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="actions">
        ${p.repo ? `<a class="btn btn--solid" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">View Repository</a>` : ''}
        ${p.demoVideo ? `<a class="btn btn--line" href="${esc(p.demoVideo)}" target="_blank" rel="noopener noreferrer">Watch Demo Video</a>` : ''}
        ${p.live ? `<a class="btn btn--line" href="${esc(p.live)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
        ${(p.case || []).length ? `<button class="btn btn--line" type="button" data-case>Read the case study</button>` : ''}
      </div>`;
    if (animate && !reduceMotion) { detail.classList.remove('is-swap'); void detail.offsetWidth; detail.classList.add('is-swap'); }
  }
  tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) showProject(+t.dataset.i); });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const n = (sel + (e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1) + projects.length) % projects.length;
    showProject(n); $$('.tab', tabs)[n].focus();
  });
  showProject(0, false);

  /* ---------- 6. TIMELINE CONTROLS ---------- */
  const track = $('#track');
  const stepBy = (d) => track.scrollBy({ left: d * Math.min(420, track.clientWidth * 0.6), behavior: reduceMotion ? 'auto' : 'smooth' });
  $('#track-prev').addEventListener('click', () => stepBy(-1));
  $('#track-next').addEventListener('click', () => stepBy(1));
  let drag = null;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, l: track.scrollLeft, moved: false }; });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; track.classList.add('is-drag'); }
    track.scrollLeft = drag.l - dx;
  });
  addEventListener('pointerup', () => { drag = null; track.classList.remove('is-drag'); });

  /* ---------- 7. CASE PANEL ---------- */
  const dlg = $('#case'), body = $('#case-body');
  function openCase() {
    const p = projects[sel]; if (!p || !(p.case || []).length) return;
    body.innerHTML = `
      <img class="case__img" src="${esc(p.image)}" alt="">
      <p class="case__kicker">${esc(p.kicker)}</p>
      <h2 id="case-title">${esc(p.title)}</h2>
      ${p.case.map((c) => `<h3>${esc(c.h)}</h3><p>${esc(c.p)}</p>`).join('')}`;
    dlg.showModal(); syncCursor();
  }
  detail.addEventListener('click', (e) => { if (e.target.closest('[data-case]')) openCase(); });
  $('#work-disc').addEventListener('click', openCase);
  dlg.addEventListener('close', syncCursor);
  $('#case-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- 8. ROUND CURSOR (mouse only, scene mode) ---------- */
  // Ring = eases toward the pointer. Dot = sits exactly on the pointer, so you always see where you click.
  const ring = $('.cursor'), dot = $('.cursor-dot'), label = $('.cursor__label');
  if (finePointer) {
    let mx = -100, my = -100, rx = -100, ry = -100, seen = false;
    const hide = () => { ring.classList.remove('is-on'); dot.classList.remove('is-on'); seen = false; };
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      if (!seen) { seen = true; rx = mx; ry = my; ring.classList.add('is-on'); dot.classList.add('is-on'); }
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.3; ry += (my - ry) * 0.3;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', (e) => {
      const l = e.target.closest('[data-cursor]');
      ring.classList.toggle('is-label', !!l); dot.classList.toggle('is-inv', !!l);
      label.textContent = l ? l.dataset.cursor : '';
      ring.classList.toggle('is-link', !l && !!e.target.closest('a, button, .tab, summary'));
    });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hide(); });
  }

  /* ---------- 9. CONTACT FORM (honest: only sends if configured in data.js) ---------- */
  const form = $('#contact-form'), status = $('#form-status');
  const say = (m, k) => { status.textContent = m; status.className = 'form__status' + (k ? ' is-' + k : ''); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    if (links.formEndpoint) {
      say('Sending…');
      try {
        const r = await fetch(links.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(); form.reset(); say('Thanks — your message was sent.');
      } catch { say('Something went wrong. Please try LinkedIn instead.', 'error'); }
    } else if (links.email) {
      const s = encodeURIComponent('Portfolio message from ' + data.get('name'));
      const b = encodeURIComponent(data.get('message') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')');
      location.href = `mailto:${links.email}?subject=${s}&body=${b}`; say('Opening your email app…');
    } else {
      say('This form isn’t connected yet, so nothing was sent. Please use LinkedIn or GitHub.', 'error');
    }
  });
})();
