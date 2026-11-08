(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  let savedMotion = null;
  try { savedMotion = localStorage.getItem('calm-motion'); } catch {}
  let motionOff = reduced.matches || savedMotion === 'off';
  function setMotion(off) {
    motionOff = off;
    root.classList.toggle('motion-off', off);
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.setAttribute('aria-label', off ? 'Включить анимацию' : 'Отключить анимацию');
    motionButton.title = off ? 'Включить анимацию' : 'Отключить анимацию';
    motionButton.querySelector('.motion-label').textContent = off ? 'Движение выкл.' : 'Движение вкл.';
  }
  setMotion(motionOff);
  motionButton.addEventListener('click', () => {
    setMotion(!motionOff);
    try { localStorage.setItem('calm-motion', motionOff ? 'off' : 'on'); } catch {}
  });
  const onPreferenceChange = e => { if (e.matches) setMotion(true); };
  if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', onPreferenceChange);
  else if (typeof reduced.addListener === 'function') reduced.addListener(onPreferenceChange);
  const portrait = document.querySelector('.portrait-zoom img');
  if (portrait && 'ResizeObserver' in window) {
    const portraitSize = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = Math.ceil(entry.contentRect.width);
        if (width > 0) portrait.sizes = width + 'px';
      }
    });
    portraitSize.observe(portrait);
  }
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    reveals.forEach(el => revealObserver.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#navigation');
  function closeMenu() {
    menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  menu.querySelectorAll('a,button').forEach(el => el.addEventListener('click', closeMenu));
  // Do not leave the mobile drawer open when switching to a wider layout.
  const mobileNavigation = matchMedia('(max-width: 960px)');
  const onLayoutChange = () => { if (!mobileNavigation.matches) closeMenu(); };
  if (typeof mobileNavigation.addEventListener === 'function') mobileNavigation.addEventListener('change', onLayoutChange);
  else if (typeof mobileNavigation.addListener === 'function') mobileNavigation.addListener(onLayoutChange);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  const panels = Array.from(document.querySelectorAll('.panel'));
  const tracker = Array.from(document.querySelectorAll('.section-tracker a'));
  let scheduled = false;
  function updateSection() {
    const middle = window.innerHeight * .45;
    let active = panels[0];
    for (const panel of panels) { if (panel.getBoundingClientRect().top <= middle) active = panel; }
    tracker.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.body.classList.toggle('scrolled', window.scrollY > 40);
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateSection); } }, { passive: true });
  window.addEventListener('resize', updateSection);
  updateSection();
  document.querySelectorAll('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialog);
      if (!dialog) return;
      dialog.showModal(); document.body.classList.add('dialog-open');
      dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'), { once: true });
    });
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-close]').forEach(link => link.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
})();
