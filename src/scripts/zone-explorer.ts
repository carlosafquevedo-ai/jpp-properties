// "Explore por zona" slider (src/components/ZoneExplorer.astro).
// - Every zone is a card in a fixed row; the active one is wider and in full colour, so the photo of the zone being
//   read stays in view. Its blurred photo is the background, its name and text on the left.
// - Choosing: a click on a card shows that zone; a click on the active card (it carries an arrow) opens its listings.
//   Also the arrows, the arrow keys (focus moves along the cards) and a sideways swipe on the panel.
// - Timer: the current segment of the progress line fills, and the zone moves on when it is full. It holds while the
//   pointer or focus is inside or the panel is off screen, and stops for good once the visitor chooses a zone.
// - The card of the zone being read always comes first in the row; the zones after it follow in order.
// Without JS the first zone shows and every card is a plain link to its listings.

const AUTOPLAY_MS = 7000;

export function initZoneExplorer(root: HTMLElement) {
  const bgs = [...root.querySelectorAll<HTMLElement>('.zx-bg')];
  const texts = [...root.querySelectorAll<HTMLElement>('.zx-text')];
  const cards = [...root.querySelectorAll<HTMLElement>('.zx-card')];
  const links = cards.map((c) => c.querySelector<HTMLAnchorElement>('a')!);
  const steps = [...root.querySelectorAll<HTMLElement>('.zx-step')];
  const row = root.querySelector<HTMLElement>('[data-zx-cards]');
  const count = root.querySelector<HTMLElement>('[data-zx-count]');
  const n = bgs.length;
  if (!row || n < 2 || cards.length !== n || texts.length !== n) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let auto = !reduced;
  root.style.setProperty('--zx-dur', `${AUTOPLAY_MS}ms`);
  root.classList.toggle('zx-manual', !auto);

  // Row edges fade out where it scrolls.
  const edges = () => {
    const max = row.scrollWidth - row.clientWidth;
    row.toggleAttribute('data-fade-l', max > 2 && row.scrollLeft > 2);
    row.toggleAttribute('data-fade-r', max > 2 && row.scrollLeft < max - 2);
  };
  row.addEventListener('scroll', edges, { passive: true });
  new ResizeObserver(edges).observe(row);

  const show = (i: number) => {
    root.classList.add('zx-fade');
    bgs.forEach((b, j) => b.toggleAttribute('data-active', j === i));
    texts.forEach((t, j) => {
      t.toggleAttribute('data-active', j === i);
      t.querySelector('a')!.tabIndex = j === i ? 0 : -1;
    });
    cards.forEach((c, j) => c.toggleAttribute('data-active', j === i));
    links.forEach((a, j) => {
      const name = a.dataset.name;
      if (j === i) {
        a.setAttribute('aria-current', 'true');
        a.setAttribute('aria-label', `Ver imóveis em ${name}`);
      } else {
        a.removeAttribute('aria-current');
        a.setAttribute('aria-label', `Mostrar ${name}`);
      }
    });
    steps.forEach((s, j) => {
      s.classList.toggle('is-done', j < i);
      s.classList.toggle('is-current', j === i);
      // Restart the fill on the new current segment.
      const bar = s.firstElementChild as HTMLElement;
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    });
    if (count) count.textContent = String(i + 1).padStart(2, '0');
    lineUp(i);
  };

  /**
   * The chosen zone's card goes first, the zones after it follow round the circle. The cards are moved in the DOM
   * (so tab order matches) and animated from where they were: cards that keep their neighbours slide; the ones that
   * wrap round the row (to the end going forward, to the front going back) fade in from that side instead of
   * crossing the others.
   */
  const lineUp = (i: number) => {
    const oldIndex = new Map(cards.map((c) => [c, [...row.children].indexOf(c)]));
    const before = new Map(cards.map((c) => [c, c.getBoundingClientRect().left]));
    const k = oldIndex.get(cards[i])!; // how far along the chosen card was
    const forward = k <= n / 2;
    const focused = document.activeElement;
    for (let j = 0; j < n; j++) row.appendChild(cards[(i + j) % n]);
    if (focused instanceof HTMLElement && root.contains(focused)) focused.focus({ preventScroll: true });
    row.scrollLeft = 0;
    edges();
    if (reduced || k === 0) return;
    cards.forEach((c) => {
      const shift = [...row.children].indexOf(c) - oldIndex.get(c)!;
      const wraps = forward ? shift > 0 : shift < 0;
      const frames = wraps
        ? [
            { transform: `translateX(${forward ? 2.5 : -2.5}rem)`, opacity: 0 },
            { transform: 'none', opacity: 1 },
          ]
        : [{ transform: `translateX(${before.get(c)! - c.getBoundingClientRect().left}px)` }, { transform: 'none' }];
      c.animate(frames, { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
  };

  const go = (i: number) => {
    i = ((i % n) + n) % n;
    if (i === current) return;
    current = i;
    show(i);
  };
  /** The visitor chose: the timer stops for good. */
  const choose = (i: number) => {
    if (auto) {
      auto = false;
      root.classList.add('zx-manual');
    }
    go(i);
  };

  // Timer: the current segment's fill ends → next zone.
  root.querySelector('[data-zx-steps]')?.addEventListener('animationend', (e) => {
    if (auto && (e.target as HTMLElement).parentElement === steps[current]) go(current + 1);
  });
  let hovering = false;
  let focused = false;
  let inView = false;
  const syncPause = () => root.classList.toggle('is-paused', hovering || focused || !inView);
  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') hovering = true;
    syncPause();
  });
  root.addEventListener('pointerleave', () => {
    hovering = false;
    syncPause();
  });
  root.addEventListener('focusin', () => {
    focused = true;
    syncPause();
  });
  root.addEventListener('focusout', (e) => {
    focused = root.contains(e.relatedTarget as Node);
    syncPause();
  });
  new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      syncPause();
    },
    { threshold: 0.4 },
  ).observe(root);

  // Cards: the first click shows the zone, a click on the active card follows its link to the listings.
  links.forEach((a, j) => {
    a.addEventListener('click', (e) => {
      if (j === current) return;
      e.preventDefault();
      choose(j);
    });
  });
  root.querySelector('[data-zx-next]')?.addEventListener('click', () => choose(current + 1));
  root.querySelector('[data-zx-prev]')?.addEventListener('click', () => choose(current - 1));

  // Arrow keys: change zone; when a card has focus, focus follows to the new one.
  root.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const onCard = links.includes(document.activeElement as HTMLAnchorElement);
    choose(current + step);
    if (onCard) links[current].focus({ preventScroll: true });
  });

  // Swipe sideways on the panel (not on the card row, which scrolls by itself) to change zone.
  let start: { x: number; y: number } | null = null;
  root.addEventListener('pointerdown', (e) => {
    start = e.pointerType !== 'mouse' && !row.contains(e.target as Node) ? { x: e.clientX, y: e.clientY } : null;
  });
  root.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) choose(current + (dx < 0 ? 1 : -1));
  });
  root.addEventListener('pointercancel', () => (start = null));

  root.dataset.ready = '';
  show(0);
  edges();
}
