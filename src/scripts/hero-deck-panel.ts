// Hero listing deck: the frosted-glass panel behind it follows the deck's outline instead of a plain box. It wraps
// the photo and the progress controls, and steps out to the left only where the listing card overhangs the photo
// (an L shape, rounded outside and with a soft inner fillet). The outline is measured from the active listing (its
// card width changes from one listing to the next) and redrawn on resize and on every slide change. Without JS the
// panel keeps its plain rounded box (CSS).

// Panel margin around the pieces, px: a little wider at the top and the sides than under the controls.
const PAD = 18;
const PAD_BOTTOM = 12;
const R_OUT = 38; // outer corners (photo radius + PAD)
const R_IN = 14; // the inner corner where the panel steps out

type Pt = [number, number];

/** Offset box of `el` relative to `root`, ignoring transforms (the deck tilts with the mouse). */
const box = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { left: x, top: y, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
};

/** Closed path through axis-aligned points (clockwise), each corner rounded with its own radius. */
const roundedPath = (pts: Pt[], radii: number[]) => {
  const n = pts.length;
  let d = '';
  pts.forEach((v, i) => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const lenA = Math.hypot(a[0] - v[0], a[1] - v[1]);
    const lenB = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const r = Math.min(radii[i], lenA / 2, lenB / 2);
    const p1: Pt = [v[0] + ((a[0] - v[0]) / lenA) * r, v[1] + ((a[1] - v[1]) / lenA) * r];
    const p2: Pt = [v[0] + ((b[0] - v[0]) / lenB) * r, v[1] + ((b[1] - v[1]) / lenB) * r];
    // Clockwise on screen (y down): a right turn is convex → sweep 1.
    const cross = (v[0] - a[0]) * (b[1] - v[1]) - (v[1] - a[1]) * (b[0] - v[0]);
    d += `${i ? 'L' : 'M'}${p1[0]},${p1[1]} A${r},${r} 0 0 ${cross > 0 ? 1 : 0} ${p2[0]},${p2[1]} `;
  });
  return `${d}Z`;
};

export function initHeroDeckPanel(deck: HTMLElement) {
  const controls = deck.querySelector<HTMLElement>('.hero-controls');
  if (!controls) return;

  const glass = document.createElement('span');
  glass.className = 'hero-deck-glass';
  glass.setAttribute('aria-hidden', 'true');
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  const rim = document.createElementNS(svgNs, 'path');
  svg.appendChild(rim);
  glass.appendChild(svg);
  deck.prepend(glass);

  const draw = () => {
    const card = deck.querySelector<HTMLElement>('.hero-card:not([inert])');
    const photo = card?.querySelector<HTMLElement>('.hc-photo');
    const product = card?.querySelector<HTMLElement>('.hc-product');
    if (!card || !photo || !product || !deck.offsetWidth) return;
    const P = box(photo, deck);
    const C = box(product, deck);
    const K = box(controls, deck);
    const top = P.top - PAD;
    const right = Math.max(P.right, K.right) + PAD;
    const bottom = Math.max(K.bottom, C.bottom) + PAD_BOTTOM;
    const left = Math.min(P.left, K.left) - PAD;
    const stepX = C.left - PAD;
    const stepY = C.top - PAD;

    // The glass element spans the deck plus the margin; path coordinates are relative to it.
    const ox = Math.min(left, stepX);
    const oy = top;
    const w = right - ox;
    const h = bottom - oy;
    Object.assign(glass.style, { left: `${ox}px`, top: `${oy}px`, width: `${w}px`, height: `${h}px` });
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const pts: Pt[] =
      stepX < left - 1
        ? [
            [left, top],
            [right, top],
            [right, bottom],
            [stepX, bottom],
            [stepX, stepY],
            [left, stepY],
          ]
        : [
            [left, top],
            [right, top],
            [right, bottom],
            [left, bottom],
          ];
    const radii = pts.length === 6 ? [R_OUT, R_OUT, R_OUT, R_OUT, R_OUT, R_IN] : [R_OUT, R_OUT, R_OUT, R_OUT];
    const d = roundedPath(
      pts.map(([x, y]) => [x - ox, y - oy]),
      radii,
    );
    glass.style.clipPath = `path('${d}')`;
    rim.setAttribute('d', d);
    deck.dataset.shaped = '';
  };

  draw();
  new ResizeObserver(draw).observe(deck);
  new MutationObserver(draw).observe(deck, { subtree: true, attributes: true, attributeFilter: ['inert'] });
  // Fonts and photos change sizes after load.
  document.fonts?.ready.then(draw);
  window.addEventListener('load', draw, { once: true });
}
