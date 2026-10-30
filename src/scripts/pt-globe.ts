// "Somos daqui" map as a 3D dotted globe: the land shape is read from the drawn map image (no map data or
// libraries), sampled into a dot matrix, and laid on a sphere with a latitude/longitude graticule. The globe turns
// into place when it scrolls into view, follows the mouse a little, and can be dragged; the office pin tracks its
// point on the sphere. The <img> stays in the page as the fallback without JS.

type Dot = { x: number; y: number; z: number; south: number; delay: number };

// One green, as a fern ramp from north to south: deep forest olive brightening through the brand greens into a lime
// glow over the Algarve. Only greens from the site scale, so the blend never turns muddy. [position 0..1, r, g, b]
const LAND: [number, number, number, number][] = [
  [0, 36, 51, 26], // --g-800
  [0.45, 75, 106, 26], // --g-500
  [0.72, 108, 145, 38], // --g-300
  [0.86, 158, 188, 58], // lime
  [1, 178, 206, 72], // lime glow
];
const landColour = (s: number) => {
  let i = 1;
  while (i < LAND.length - 1 && s > LAND[i][0]) i++;
  const [p0, r0, g0, b0] = LAND[i - 1];
  const [p1, r1, g1, b1] = LAND[i];
  const t = clamp((s - p0) / (p1 - p0), 0, 1);
  return [r0 + (r1 - r0) * t, g0 + (g1 - g0) * t, b0 + (b1 - b0) * t].map(Math.round).join(',');
};

const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Stylised globe: one degree of real latitude spans K degrees on the sphere, so Portugal covers a large cap and
// the graticule curves visibly.
const K = 16;
const REAL_LAT_SPAN = 5.2; // mainland Portugal, north to south, in degrees
const CAMERA = 3.4; // camera distance in sphere radii
const REST = { yaw: 4 * DEG, pitch: -14 * DEG };
const INTRO = { yaw: -38 * DEG, pitch: -34 * DEG };
const LIMIT = 28 * DEG;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Point on the unit sphere for local angles a (east) and b (north), in radians. */
const onSphere = (a: number, b: number) => ({
  x: Math.cos(b) * Math.sin(a),
  y: Math.sin(b),
  z: Math.cos(b) * Math.cos(a),
});

/**
 * Land mask from the drawing, as an n×n grid. The land is only faint hatching, so the image is averaged down to
 * the grid, any ink counts, holes in the hatching are closed, and thin construction lines are opened away.
 */
const landMask = (img: HTMLImageElement, n: number) => {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, n, n);
  const data = ctx.getImageData(0, 0, n, n).data;
  let grid = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) grid[i] = data[i * 4 + 3] > 0 ? 1 : 0;
  const pass = (src: Uint8Array, grow: boolean) => {
    const out = new Uint8Array(n * n);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let any = false;
        let all = true;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            const v = xx >= 0 && yy >= 0 && xx < n && yy < n ? src[yy * n + xx] : 0;
            if (v) any = true;
            else all = false;
          }
        out[y * n + x] = (grow ? any : all) ? 1 : 0;
      }
    return out;
  };
  grid = pass(pass(grid, true), false); // close: fill gaps in the hatching
  grid = pass(pass(grid, false), true); // open: drop lines one or two cells thick
  return grid;
};

export function initPtGlobe(map: HTMLElement) {
  const inner = map.querySelector<HTMLElement>('.pt-map-inner');
  const img = inner?.querySelector<HTMLImageElement>('img');
  const pin = inner?.querySelector<HTMLElement>('.pt-pin');
  if (!inner || !img || !pin) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const start = async () => {
    const src = new Image();
    src.src = img.currentSrc || img.src;
    try {
      await src.decode();
    } catch {
      return; // keep the drawing
    }

    // One dot per land cell of a 78×78 grid over the square image.
    const N = 78;
    const grid = landMask(src, N);
    let minX = N, maxX = 0, minY = N, maxY = 0;
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        if (grid[y * N + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
    if (maxY <= minY) return;
    const h = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    // Image cell -> local sphere angles (radians), keeping the drawing's proportions.
    const toAngles = (x: number, y: number) => ({
      a: ((x - cx) / h) * REAL_LAT_SPAN * K * DEG,
      b: ((cy - y) / h) * REAL_LAT_SPAN * K * DEG,
    });

    const dots: Dot[] = [];
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) {
        if (!grid[y * N + x]) continue;
        const { a, b } = toAngles(x, y);
        const south = (y - minY) / h;
        // The draw-in runs as a wave from the Algarve northwards.
        dots.push({ ...onSphere(a, b), south, delay: (1 - south) * 0.55 + Math.random() * 0.12 });
      }

    // The office pin, from its position in % of the image (set in CSS).
    const pinX = (parseFloat(getComputedStyle(pin).left) / inner.clientWidth) * N;
    const pinY = (parseFloat(getComputedStyle(pin).top) / inner.clientHeight) * N;
    const pinAngles = toAngles(pinX, pinY);
    const pinPoint = onSphere(pinAngles.a, pinAngles.b);

    const canvas = document.createElement('canvas');
    canvas.className = 'pt-globe';
    canvas.setAttribute('aria-hidden', 'true');
    inner.insertBefore(canvas, pin);
    const ctx = canvas.getContext('2d')!;
    map.dataset.globe = '';

    let W = 0, H = 0, dpr = 1;
    // Fit: scale and centre so the land fills the square at the resting pose.
    let scale = 1, ox = 0, oy = 0;

    const view = { yaw: reduced ? REST.yaw : INTRO.yaw, pitch: reduced ? REST.pitch : INTRO.pitch };
    const target = { yaw: REST.yaw, pitch: REST.pitch };
    const drag = { yaw: 0, pitch: 0 };
    let reveal = reduced ? 1 : 0; // 0 → 1 during the intro
    let introStart = 0;

    const rotate = (p: { x: number; y: number; z: number }, yaw: number, pitch: number) => {
      const cyw = Math.cos(yaw), syw = Math.sin(yaw);
      const x1 = p.x * cyw + p.z * syw;
      const z1 = -p.x * syw + p.z * cyw;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
    };
    const project = (p: { x: number; y: number; z: number }) => {
      const f = CAMERA / (CAMERA - p.z);
      return { sx: ox + p.x * f * scale, sy: oy - p.y * f * scale, f, visible: p.z > 1 / CAMERA };
    };

    const fit = () => {
      const r = inner.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      scale = 1; ox = 0; oy = 0;
      for (const d of dots) {
        const q = project(rotate(d, REST.yaw, REST.pitch));
        x0 = Math.min(x0, q.sx); x1 = Math.max(x1, q.sx);
        y0 = Math.min(y0, q.sy); y1 = Math.max(y1, q.sy);
      }
      scale = Math.min((H * 0.84) / (y1 - y0), (W * 0.9) / (x1 - x0));
      ox = W / 2 - ((x0 + x1) / 2) * scale;
      oy = H / 2 - ((y0 + y1) / 2) * scale;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const yaw = view.yaw;
      const pitch = view.pitch;

      // The sphere: silhouette radius for a camera at distance CAMERA, soft shading and a fine edge.
      const R = scale * CAMERA / Math.sqrt(CAMERA * CAMERA - 1);
      const g = ctx.createRadialGradient(ox - R * 0.35, oy - R * 0.4, R * 0.1, ox, oy, R);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.7, 'rgba(242,247,232,1)');
      g.addColorStop(1, 'rgba(222,233,203,1)');
      ctx.globalAlpha = 0.25 + 0.75 * reveal;
      ctx.beginPath();
      ctx.arc(ox, oy, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Soft lime glow on the sphere around the Algarve; it follows the coast as the globe turns.
      const glow = project(rotate(pinPoint, yaw, pitch));
      if (glow.visible) {
        ctx.save();
        ctx.clip();
        const gg = ctx.createRadialGradient(glow.sx, glow.sy, 0, glow.sx, glow.sy, R * 0.75);
        gg.addColorStop(0, `rgba(183,212,74,${0.4 * reveal})`);
        gg.addColorStop(0.45, `rgba(158,188,58,${0.14 * reveal})`);
        gg.addColorStop(1, 'rgba(158,188,58,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(75,106,26,0.3)';
      ctx.stroke();

      // Graticule: every 10° on the stylised sphere (about 1° of real latitude).
      ctx.strokeStyle = 'rgba(75,106,26,0.16)';
      ctx.lineWidth = 0.8;
      const line = (pts: { x: number; y: number; z: number }[]) => {
        let pen = false;
        ctx.beginPath();
        for (const p of pts) {
          const q = project(rotate(p, yaw, pitch));
          if (!q.visible) { pen = false; continue; }
          if (pen) ctx.lineTo(q.sx, q.sy);
          else ctx.moveTo(q.sx, q.sy);
          pen = true;
        }
        ctx.stroke();
      };
      for (let b = -80; b <= 80; b += 10) {
        const pts = [];
        for (let a = -180; a <= 180; a += 4) pts.push(onSphere(a * DEG, b * DEG));
        line(pts);
      }
      for (let a = -180; a < 180; a += 10) {
        const pts = [];
        for (let b = -90; b <= 90; b += 4) pts.push(onSphere(a * DEG, b * DEG));
        line(pts);
      }

      // Land dots: the fern ramp, the Algarve brightest and a little larger; nearer dots larger.
      ctx.globalAlpha = 1;
      for (const d of dots) {
        const t = clamp((reveal - d.delay) / 0.35, 0, 1);
        if (t <= 0) continue;
        const q = project(rotate(d, yaw, pitch));
        if (!q.visible) continue;
        const r = (d.south > 0.82 ? 1.8 : 1.5) * q.f * (0.6 + 0.4 * easeOut(t));
        ctx.fillStyle = `rgba(${landColour(d.south)},${(0.85 + 0.15 * d.south) * t})`;
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft round vignette so nothing ends in the canvas's square edge.
      ctx.globalCompositeOperation = 'destination-in';
      const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.min(W, H) * 0.5);
      v.addColorStop(0, 'rgba(0,0,0,1)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      // Pin follows its point on the sphere.
      const pq = project(rotate(pinPoint, yaw, pitch));
      pin.style.left = `${pq.sx}px`;
      pin.style.top = `${pq.sy}px`;
    };

    // Animation: the intro, then easing toward the target pose (mouse + drag) until it settles.
    let raf = 0;
    const tick = (now: number) => {
      raf = 0;
      if (introStart) {
        const t = clamp((now - introStart) / 1800, 0, 1);
        reveal = t;
        const e = easeOut(t);
        view.yaw = INTRO.yaw + (target.yaw + drag.yaw - INTRO.yaw) * e;
        view.pitch = INTRO.pitch + (target.pitch + drag.pitch - INTRO.pitch) * e;
        if (t >= 1) introStart = 0;
      } else {
        view.yaw += (target.yaw + drag.yaw - view.yaw) * 0.12;
        view.pitch += (target.pitch + drag.pitch - view.pitch) * 0.12;
      }
      draw();
      const settled =
        !introStart &&
        Math.abs(target.yaw + drag.yaw - view.yaw) < 0.0005 &&
        Math.abs(target.pitch + drag.pitch - view.pitch) < 0.0005;
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    fit();
    draw();
    new ResizeObserver(() => {
      fit();
      draw();
    }).observe(inner);

    if (!reduced) {
      new IntersectionObserver(
        (entries, obs) => {
          if (entries.some((e) => e.isIntersecting)) {
            introStart = performance.now();
            kick();
            obs.disconnect();
          }
        },
        { threshold: 0.35 },
      ).observe(map);

      if (finePointer) {
        inner.addEventListener('pointermove', (e) => {
          if (dragging) return;
          const r = inner.getBoundingClientRect();
          target.yaw = REST.yaw + ((e.clientX - r.left) / r.width - 0.5) * 14 * DEG;
          target.pitch = REST.pitch - ((e.clientY - r.top) / r.height - 0.5) * 8 * DEG;
          kick();
        });
        inner.addEventListener('pointerleave', () => {
          target.yaw = REST.yaw;
          target.pitch = REST.pitch;
          kick();
        });
      }
    }

    // Drag to rotate (horizontal only on touch, so vertical swipes still scroll the page).
    let dragging = false;
    let last = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      drag.yaw = clamp(drag.yaw + (e.clientX - last.x) * 0.006, -LIMIT, LIMIT);
      if (e.pointerType === 'mouse') drag.pitch = clamp(drag.pitch - (e.clientY - last.y) * 0.004, -LIMIT, LIMIT);
      last = { x: e.clientX, y: e.clientY };
      kick();
    });
    const release = () => {
      dragging = false;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  };

  // Build it only when the map comes near the viewport.
  new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        obs.disconnect();
        start();
      }
    },
    { rootMargin: '300px' },
  ).observe(map);
}
