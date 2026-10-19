/* Progressive enhancement: the original sections remain usable without JS. */
(() => {
  const hero = document.querySelector('[data-scroll-opening]');
  const collections = document.getElementById('collections');
  if (!hero || !collections || !CSS.supports('position', 'sticky')) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const shell = document.createElement('div');
  const stage = document.createElement('div');
  shell.className = 'opening-transition';
  stage.className = 'opening-stage';
  hero.before(shell);
  shell.append(stage);
  stage.append(hero, collections);
  // Collections is the revealed layer, not an independent fade-in.
  collections.querySelectorAll('.reveal').forEach(el => el.classList.remove('reveal'));
  collections.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
  const cards = Array.from(collections.querySelectorAll('.collection-grid .collection-card'));
  let active = false, start = 0, distance = 1, frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function renderCards(openingProgress) {
    collections.classList.toggle('collections-motion', !motion.matches);
    const titleProgress = motion.matches || !active ? 1 : clamp((openingProgress - .1) / .8);
    collections.style.setProperty('--collection-title-progress', titleProgress.toFixed(5));
    const sectionProgress = motion.matches ? 1 : active ? clamp((openingProgress - .18) / .7) : clamp((window.innerHeight * .95 - collections.getBoundingClientRect().top) / (window.innerHeight * .6));
    collections.style.setProperty('--collections-reveal-progress', sectionProgress.toFixed(5));
    cards.forEach(card => {
      const viewportProgress = clamp((window.innerHeight * .92 - card.getBoundingClientRect().top) / (window.innerHeight * .85));
      const progress = motion.matches ? 1 : Math.min(viewportProgress, active ? clamp((openingProgress - .15) / .85) : 1);
      card.style.setProperty('--collection-progress', progress.toFixed(5));
      card.style.setProperty('--collection-clarity', clamp(progress / .6).toFixed(5));
    });
  }
  function render() {
    frame = 0;
    if (!active) { renderCards(1); return; }
    const progress = clamp((window.scrollY - start) / distance);
    shell.style.setProperty('--opening-progress', progress.toFixed(5));
    shell.style.setProperty('--opening-copy-opacity', clamp(1 - progress / .8).toFixed(5));
    shell.style.setProperty('--opening-collections-opacity', clamp((progress - .18) / .7).toFixed(5));
    renderCards(progress);
    hero.inert = progress >= .98;
    collections.inert = progress < .65;
    if (hero.inert && hero.contains(document.activeElement)) {
      collections.querySelector('a')?.focus({ preventScroll: true });
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function measure() {
    shell.classList.remove('is-active');
    hero.inert = collections.inert = false;
    // Small landscape screens keep the original unclipped document flow.
    active = !motion.matches && window.innerHeight >= 500;
    if (!active) { render(); return; }
    const rect = hero.getBoundingClientRect();
    const height = rect.height;
    start = rect.top + window.scrollY;
    distance = Math.round(height * 1.35);
    shell.style.setProperty('--opening-height', `${height}px`);
    shell.style.setProperty('--opening-distance', `${distance}px`);
    shell.classList.add('is-active');
    shell.style.setProperty('--opening-stage-height', `${Math.max(height, collections.getBoundingClientRect().height)}px`);
    render();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  motion.addEventListener('change', measure);
  hero.querySelector('a[href="#collections"]')?.addEventListener('click', event => {
    if (!active) return;
    event.preventDefault();
    window.scrollTo({ top: start + distance, behavior: 'smooth' });
  });
  collections.addEventListener('focusin', () => {
    if (active && window.scrollY < start + distance) {
      window.scrollTo({ top: start + distance, behavior: 'instant' });
      render();
    }
  });
  measure();
  if (active && location.hash === '#collections') {
    window.scrollTo({ top: start + distance, behavior: 'instant' });
    render();
  }
})();
