// "Somos daqui" map as a 3D globe: the land shape is read from the drawn map image (no map data or libraries),
// smoothed into a contour, and laid on a sphere with a latitude/longitude graticule. The land is one solid shape in
// the fern ramp with a light rim on its coast, and a fine network of light (hairlines between small glowing nodes,
// the office pin as its hub) runs over it, the same thin green light as the site's other effects. The globe turns
// into place when it scrolls into view, follows the mouse a little, and can be dragged; the office pin tracks its
// point on the sphere. The <img> stays in the page as the fallback without JS.

type P3 = { x: number; y: number; z: number };
type Node = P3 & { south: number; delay: number };
type Link = { a: P3; b: P3; delay: number; hub: boolean };

// One green, as a fern ramp from north to south: deep forest olive brightening through the brand greens into a lime
// glow over the Algarve (the land's fill gradient). Only greens from the site scale, so the blend never turns muddy. [position 0..1, r, g, b]
const LAND: [number, number, number, number][] = [
  [0, 36, 51, 26], // --g-800
  [0.45, 75, 106, 26], // --g-500
  [0.72, 108, 145, 38], // --g-300
  [0.86, 158, 188, 58], // lime
  [1, 178, 206, 72], // lime glow
];
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

/** Small seeded random, so the network is the same on every visit. */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

/** 3×3 box blur of a field, to round the stair-stepped mask into a smooth coast without losing its shape. */
const blur = (src: Float32Array, n: number) => {
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < n && yy < n) sum += src[yy * n + xx];
        }
      out[y * n + x] = sum / 9;
    }
  return out;
};

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

    // Smooth field and marching squares: each grid square keeps the part of it that is land (clipped at the 0.5
    // contour, interpolated along its edges), so the fill and the coastline share one smooth outline.
    let field = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) field[i] = grid[i];
    field = blur(field, N);
    const f = (x: number, y: number) => (x >= 0 && y >= 0 && x < N && y < N ? field[y * N + x] : 0);
    const at = (x: number, y: number) => {
      const { a, b } = toAngles(x, y);
      return onSphere(a, b);
    };
    const polys: P3[][] = [];
    const coast: [P3, P3][] = [];
    const outline: P3[] = [];
    for (let y = minY - 2; y <= maxY + 1; y++)
      for (let x = minX - 2; x <= maxX + 1; x++) {
        const c: [number, number, number][] = [
          [x, y, f(x, y)],
          [x + 1, y, f(x + 1, y)],
          [x + 1, y + 1, f(x + 1, y + 1)],
          [x, y + 1, f(x, y + 1)],
        ];
        if (c.every((k) => k[2] < 0.5)) continue;
        const poly: P3[] = [];
        const cross: P3[] = [];
        for (let i = 0; i < 4; i++) {
          const [x0, y0, v0] = c[i];
          const [x1, y1, v1] = c[(i + 1) % 4];
          if (v0 >= 0.5) poly.push(at(x0, y0));
          if (v0 >= 0.5 !== v1 >= 0.5) {
            const t = (0.5 - v0) / (v1 - v0);
            const p3 = at(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
            poly.push(p3);
            cross.push(p3);
          }
        }
        polys.push(poly);
        for (let i = 0; i + 1 < cross.length; i += 2) {
          coast.push([cross[i], cross[i + 1]]);
          outline.push(cross[i]);
        }
      }
    // North and south ends of the land, for the fern gradient.
    const north = at(cx, minY);
    const southEnd = at(cx, maxY);

    // The network: nodes spread evenly over the inland (seeded, at least 7 cells apart), each linked to its two
    // nearest neighbours. It draws in as a wave from the Algarve northwards.
    const rand = seeded(9361);
    const spots: { x: number; y: number }[] = [];
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) if (f(x, y) > 0.8) spots.push({ x, y });
    for (let i = spots.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    const picked: { x: number; y: number }[] = [];
    for (const sp of spots) {
      if (picked.length >= 30) break;
      if (picked.every((q) => Math.hypot(q.x - sp.x, q.y - sp.y) >= 7)) picked.push(sp);
    }
    const nodes: Node[] = picked.map((q) => {
      const south = (q.y - minY) / h;
      return { ...at(q.x, q.y), south, delay: (1 - south) * 0.5 + rand() * 0.1 };
    });
    const links: Link[] = [];
    const seen = new Set<string>();
    picked.forEach((q, i) => {
      picked
        .map((r, j) => ({ j, d: Math.hypot(r.x - q.x, r.y - q.y) }))
        .filter((e) => e.j !== i && e.d < 16)
        .sort((m, n) => m.d - n.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          links.push({ a: nodes[i], b: nodes[j], delay: Math.max(nodes[i].delay, nodes[j].delay), hub: false });
        });
    });

    // The office pin, from its position in % of the image (set in CSS).
    const pinX = (parseFloat(getComputedStyle(pin).left) / inner.clientWidth) * N;
    const pinY = (parseFloat(getComputedStyle(pin).top) / inner.clientHeight) * N;
    const pinAngles = toAngles(pinX, pinY);
    const pinPoint = onSphere(pinAngles.a, pinAngles.b);
    // The office is the hub: its three nearest nodes link to it in a brighter line.
    picked
      .map((q, i) => ({ i, d: Math.hypot(q.x - pinX, q.y - pinY) }))
      .sort((m, n) => m.d - n.d)
      .slice(0, 3)
      .forEach(({ i }) => links.push({ a: pinPoint, b: nodes[i], delay: 0.1, hub: true }));

    const canvas = document.createElement('canvas');
    canvas.className = 'pt-globe';
    canvas.setAttribute('aria-hidden', 'true');
    inner.insertBefore(canvas, pin);
    const ctx = canvas.getContext('2d')!;
    // The land is drawn opaque on its own layer, then laid on the globe in one pass, so the seams between the
    // marching-squares pieces never show.
    const landLayer = document.createElement('canvas');
    const lctx = landLayer.getContext('2d')!;
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
      canvas.width = landLayer.width = Math.round(W * dpr);
      canvas.height = landLayer.height = Math.round(H * dpr);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      scale = 1; ox = 0; oy = 0;
      for (const d of outline) {
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

      // Land: one solid shape in the fern ramp (deep olive in the north to lime over the Algarve), with a soft
      // light from the top left so it reads as tinted glass on the globe.
      const P = (p: P3) => project(rotate(p, yaw, pitch));
      const landIn = easeOut(clamp(reveal / 0.6, 0, 1));
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, W, H);
      const qn = P(north);
      const qs = P(southEnd);
      const fern = lctx.createLinearGradient(qn.sx, qn.sy, qs.sx, qs.sy);
      for (const [pos, r, gr, b] of LAND) fern.addColorStop(pos, `rgb(${r},${gr},${b})`);
      lctx.fillStyle = fern;
      lctx.strokeStyle = fern;
      lctx.lineWidth = 0.6;
      lctx.lineJoin = 'round';
      lctx.beginPath();
      for (const poly of polys) {
        poly.forEach((p, i) => {
          const q = P(p);
          if (i) lctx.lineTo(q.sx, q.sy);
          else lctx.moveTo(q.sx, q.sy);
        });
        lctx.closePath();
      }
      lctx.fill();
      lctx.stroke();
      lctx.globalCompositeOperation = 'source-atop';
      const sheen = lctx.createLinearGradient(qn.sx - R * 0.4, qn.sy, qs.sx + R * 0.4, qs.sy);
      sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(255,255,255,0.08)');
      lctx.fillStyle = sheen;
      lctx.fillRect(0, 0, W, H);
      lctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.92 * landIn;
      ctx.drawImage(landLayer, 0, 0, W, H);
      ctx.globalAlpha = 1;

      // Coast: a light rim, like the edge of a glass piece.
      ctx.beginPath();
      for (const [p0, p1] of coast) {
        const q0 = P(p0);
        const q1 = P(p1);
        ctx.moveTo(q0.sx, q0.sy);
        ctx.lineTo(q1.sx, q1.sy);
      }
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(214,232,150,${0.85 * landIn})`;
      ctx.stroke();

      // Network: hairlines grow from one node to the other, then the nodes light up.
      for (const l of links) {
        const t = easeOut(clamp((reveal - l.delay) / 0.4, 0, 1));
        if (t <= 0) continue;
        const qa = P(l.a);
        const qb = P(l.b);
        ctx.beginPath();
        ctx.moveTo(qa.sx, qa.sy);
        ctx.lineTo(qa.sx + (qb.sx - qa.sx) * t, qa.sy + (qb.sy - qa.sy) * t);
        ctx.lineWidth = l.hub ? 1.1 : 0.75;
        ctx.strokeStyle = l.hub ? 'rgba(232,242,196,0.85)' : 'rgba(214,232,150,0.45)';
        ctx.stroke();
      }
      for (const n of nodes) {
        const t = clamp((reveal - n.delay - 0.2) / 0.3, 0, 1);
        if (t <= 0) continue;
        const q = P(n);
        const r = (1.3 + 0.6 * n.south) * q.f;
        const halo = ctx.createRadialGradient(q.sx, q.sy, 0, q.sx, q.sy, r * 4);
        halo.addColorStop(0, `rgba(214,232,150,${0.45 * t})`);
        halo.addColorStop(1, 'rgba(214,232,150,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240,247,220,${t})`;
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
