// "Somos daqui" map as a 3D globe: the land shape is read from the drawn map image (no map data or libraries),
// smoothed into a contour, and laid on a frosted glass ball in the brand's pale greens (as the reference globe), with
// soft, frosted land around it: the rest of Iberia, the west of France, north-west Africa and, on the left, the
// Americas. Portugal is raised off the ball (a dark slab and a soft shadow), its top a solid fern ramp and a light rim
// on its coast, and a fine network of light (hairlines between small glowing nodes, the office pin as its hub) runs
// over it, the same thin green light as the site's other effects. The globe turns into place when it scrolls into
// view, follows the mouse a little, and can be dragged; the office pin tracks its point on the sphere. The <img>
// stays in the page as the fallback without JS.

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
const K = 13;
const REAL_LAT_SPAN = 5.2; // mainland Portugal, north to south, in degrees
const CAMERA = 3.4; // camera distance in sphere radii
const REST = { yaw: 4 * DEG, pitch: 8 * DEG };
const INTRO = { yaw: -38 * DEG, pitch: -14 * DEG };
const LIMIT = 28 * DEG;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Neighbouring land, so the globe reads as a piece of the world and not Portugal alone: the rest of Iberia, the west
// of France and north-west Africa, as simplified coastlines [lat, lon]. Placed with
// the same stylised scale as Portugal (the drawing's box is mainland Portugal: 36.96–42.15 N, 9.50–6.19 W). Where a
// coast runs past the horizon it is laid on the edge of the ball. Drawn pale, under Portugal, so Portugal stays the
// one in colour.
const GEO_CENTRE = { lat: 39.555, lon: -7.845 };
const NEIGHBOURS: [number, number][][] = [
  // Iberia and France, from Cape Finisterre clockwise (Portugal's coast included, under the drawn shape).
  [
    [42.88, -9.27], [43.37, -8.4], [43.79, -7.69], [43.55, -5.66], [43.46, -3.8], [43.35, -2.93], [43.36, -1.78],
    [44.66, -1.25], [45.6, -1.2], [46.16, -1.15], [47.27, -2.2], [47.6, -3.1], [48.04, -4.73], [48.39, -4.49],
    [48.7, -3.0], [48.65, -1.9], [49.65, -1.62], [49.49, 0.1], [50.1, 1.5], [50.95, 1.85], [51.1, 8], [43.8, 8],
    [43.7, 7.26], [43.3, 5.37], [43.4, 3.6], [42.7, 3.0], [42.32, 3.32], [41.38, 2.17], [41.1, 1.25], [40.7, 0.85],
    [39.47, -0.33], [38.73, 0.23], [38.34, -0.48], [37.63, -0.69], [36.72, -2.19], [36.83, -2.46], [36.72, -4.42],
    [36.14, -5.35], [36.01, -5.6], [36.53, -6.29], [37.25, -6.95], [37.2, -7.41], [37.0, -7.93], [37.0, -8.94],
    [37.95, -8.87], [38.78, -9.5], [39.36, -9.4], [40.64, -8.75], [41.15, -8.68], [41.69, -8.85], [41.87, -8.87],
    [42.24, -8.72],
  ],
  // North-west Africa, from Cape Spartel eastwards and back up the Atlantic coast (closed far to the south).
  [
    [35.79, -5.92], [35.89, -5.31], [35.57, -5.37], [35.25, -3.93], [35.17, -2.93], [35.7, -0.63], [36.75, 3.06],
    [37.1, 8], [26, 8], [26, -14.5], [27.9, -12.9], [28.5, -11.2], [29.6, -10.1], [30.42, -9.6], [31.5, -9.77],
    [32.3, -9.24], [33.25, -8.5], [33.6, -7.6], [34.0, -6.83], [34.26, -6.6], [35.19, -6.15], [35.46, -6.03],
  ],
];
// The Americas on the left of the ball, so the globe reads as the Atlantic world and its west side is not empty (as
// in the reference: soft continents hugging the edge). At this stylised scale the real Americas would sit far behind
// the ball, so they are drawn in the ball's own angles [b north, a east] in degrees, simplified and rounded: North
// America with Greenland, a few Caribbean islands and South America. Coasts past the horizon are laid on its edge.
const AMERICAS: [number, number][][] = [
  // North America, from the Arctic down the east coast, the Gulf and Central America, back up past the edge.
  [
    [70, -60], [68, -50], [64, -44], [60, -47], [57, -40], [52, -43], [46, -47], [40, -50], [34, -54], [28, -56],
    [21, -57], [24, -61], [25, -67], [19, -70], [13, -65], [7, -67], [2, -72], [4, -86], [22, -100], [55, -104],
    [70, -96],
  ],
  // Greenland.
  [[80, -46], [79, -32], [74, -30], [70, -36], [72, -44]],
  // Caribbean islands.
  [[17, -58], [15.5, -52], [13.5, -55]],
  [[11.5, -51], [10.5, -48], [9, -50.5]],
  // South America, from the north coast round the eastern bulge to the southern tip and back past the edge.
  [
    [0, -60], [-4, -50], [-11, -42], [-19, -37], [-27, -40], [-35, -46], [-44, -52], [-53, -59], [-60, -66],
    [-56, -78], [-34, -96], [-4, -98], [3, -78],
  ],
];
// Moved east into the free band between Portugal and the ball's edge (the coasts about 25° to 45° west of centre).
const americasOnSphere = (b: number, a: number) => onSphere((-15 + (a + 27) * 0.75) * DEG, b * DEG);

/** Real latitude/longitude to a point on the stylised sphere (same scale as the drawing). */
const geoOnSphere = (lat: number, lon: number) => {
  // Kept inside the poles and the back meridian: at this scale far coasts would otherwise wrap round the ball.
  const a = clamp((lon - GEO_CENTRE.lon) * Math.cos(lat * DEG) * K, -170, 170) * DEG;
  const b = clamp((lat - GEO_CENTRE.lat) * K, -88, 88) * DEG;
  return onSphere(a, b);
};
/** A coastline with extra points along each edge, so its curve follows the ball. */
const densify = (ring: [number, number][], step = 0.2) => {
  const out: [number, number][] = [];
  ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length];
    const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
    for (let k = 0; k < n; k++) out.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  });
  return out;
};

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
    // contour, interpolated along its edges), so the fill and the coastline share one smooth edge.
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

    const neighbours: P3[][] = [
      ...NEIGHBOURS.map((ring) => densify(ring).map(([la, lo]) => geoOnSphere(la, lo))),
      ...AMERICAS.map((ring) => densify(ring, 2).map(([b, a]) => americasOnSphere(b, a))),
    ];

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
      // The whole sphere sits in the square (a crisp 3D ball, not a cropped close-up), a little above centre so its
      // shadow fits underneath.
      const R = Math.min(W, H) * 0.38;
      scale = (R * Math.sqrt(CAMERA * CAMERA - 1)) / CAMERA;
      ox = W / 2;
      oy = H * 0.475;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const yaw = view.yaw;
      const pitch = view.pitch;

      // The sphere: a pearly ball lit from the top left. A soft shadow on the ground first, then the body (white
      // highlight to a cool sage shade), a darker rim on the shaded side and a small specular highlight.
      const R = scale * CAMERA / Math.sqrt(CAMERA * CAMERA - 1);
      ctx.globalAlpha = 0.25 + 0.75 * reveal;
      const floor = ctx.createRadialGradient(ox, oy + R * 1.04, 0, ox, oy + R * 1.04, R * 0.8);
      floor.addColorStop(0, 'rgba(27,30,28,0.22)');
      floor.addColorStop(1, 'rgba(27,30,28,0)');
      ctx.save();
      ctx.translate(ox, oy + R * 1.04);
      ctx.scale(1, 0.16);
      ctx.translate(-ox, -(oy + R * 1.04));
      ctx.fillStyle = floor;
      ctx.beginPath();
      ctx.arc(ox, oy + R * 1.04, R * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Frosted pearl, as the reference globe: near-white top left deepening to a soft sage at the lower right (the
      // brand's pale greens instead of its blue).
      const g = ctx.createRadialGradient(ox - R * 0.42, oy - R * 0.46, R * 0.04, ox + R * 0.05, oy + R * 0.1, R * 1.12);
      g.addColorStop(0, 'rgb(238,244,228)');
      g.addColorStop(0.3, 'rgb(205,220,184)');
      g.addColorStop(0.68, 'rgb(166,190,138)');
      g.addColorStop(1, 'rgb(112,142,88)');
      ctx.beginPath();
      ctx.arc(ox, oy, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.save();
      ctx.clip();
      // Shaded side: a soft dark crescent on the lower right.
      const shade = ctx.createRadialGradient(ox - R * 0.3, oy - R * 0.35, R * 0.75, ox - R * 0.3, oy - R * 0.35, R * 1.5);
      shade.addColorStop(0, 'rgba(27,30,28,0)');
      shade.addColorStop(1, 'rgba(27,30,28,0.16)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);

      // Soft lime glow on the sphere around the Algarve; it follows the coast as the globe turns.
      const glow = project(rotate(pinPoint, yaw, pitch));
      if (glow.visible) {
        const gg = ctx.createRadialGradient(glow.sx, glow.sy, 0, glow.sx, glow.sy, R * 0.6);
        gg.addColorStop(0, `rgba(183,212,74,${0.22 * reveal})`);
        gg.addColorStop(1, 'rgba(158,188,58,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, W, H);
      }

      // A soft light band across the upper left, as the sheen on a glass ball.
      const ballSheen = ctx.createRadialGradient(ox - R * 0.45, oy - R * 0.5, 0, ox - R * 0.45, oy - R * 0.5, R * 0.9);
      ballSheen.addColorStop(0, 'rgba(255,255,255,0.32)');
      ballSheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = ballSheen;
      ctx.fillRect(0, 0, W, H);

      // Neighbouring land: light and neutral with fine stripes (as the reference's continents), a little raised (thin slab and soft shadow), with fine stripes along the
      // latitude and a light rim, like the continents of a striped globe.
      const horizon = 1 / CAMERA;
      const onBall = (p: P3) => {
        let q = rotate(p, yaw, pitch);
        if (q.z <= horizon) {
          // Past the horizon: laid on the visible edge of the ball, in the same direction.
          const k = Math.sqrt((1 - horizon * horizon) / Math.max(q.x * q.x + q.y * q.y, 1e-6));
          q = { x: q.x * k, y: q.y * k, z: horizon + 1e-4 };
        }
        return project(q);
      };
      // Rounded coasts: a smooth curve through the midpoints of each coast, so the shapes read soft, as in the reference.
      const neighbourPath = (dx: number, dy: number) => {
        ctx.beginPath();
        for (const ringPts of neighbours) {
          const pts = ringPts.map((p) => onBall(p));
          const n = pts.length;
          const mid = (i: number) => {
            const p = pts[i % n];
            const q = pts[(i + 1) % n];
            return { x: (p.sx + q.sx) / 2 + dx, y: (p.sy + q.sy) / 2 + dy };
          };
          const m0 = mid(n - 1);
          ctx.moveTo(m0.x, m0.y);
          for (let i = 0; i < n; i++) {
            const m = mid(i);
            ctx.quadraticCurveTo(pts[i].sx + dx, pts[i].sy + dy, m.x, m.y);
          }
          ctx.closePath();
        }
      };
      const lift = Math.max(2, R * 0.014);
      // Raised a little: a soft shadow to the lower right.
      ctx.save();
      ctx.shadowColor = 'rgba(27,30,28,0.14)';
      ctx.shadowBlur = R * 0.04;
      ctx.shadowOffsetX = R * 0.006;
      ctx.shadowOffsetY = R * 0.014;
      neighbourPath(lift * 0.25, lift * 0.45);
      ctx.fillStyle = 'rgba(120,146,100,0.45)';
      ctx.fill('nonzero');
      ctx.restore();
      // Frosted top: lighter than the ball, brightest where the light falls.
      neighbourPath(0, 0);
      const frost = ctx.createLinearGradient(ox - R, oy - R, ox + R * 0.8, oy + R * 0.9);
      frost.addColorStop(0, 'rgba(255,255,255,0.97)');
      frost.addColorStop(0.55, 'rgba(243,248,236,0.94)');
      frost.addColorStop(1, 'rgba(222,233,208,0.92)');
      ctx.fillStyle = frost;
      ctx.fill('nonzero');
      // A light edge on the side facing the light, a faint darker one on the other.
      ctx.lineJoin = 'round';
      neighbourPath(-0.4, -0.4);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      neighbourPath(0.5, 0.7);
      ctx.strokeStyle = 'rgba(75,106,26,0.08)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      // Edge of the ball: a hairline, brighter where the light falls.
      const edge = ctx.createLinearGradient(ox - R, oy - R, ox + R, oy + R);
      edge.addColorStop(0, 'rgba(255,255,255,0.9)');
      edge.addColorStop(1, 'rgba(75,106,26,0.28)');
      ctx.beginPath();
      ctx.arc(ox, oy, R - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Land, raised off the ball: a dark slab underneath (its thickness, towards the shaded side) casting a soft
      // shadow on the sphere, then the top face in the fern ramp (deep olive in the north to lime over the Algarve),
      // solid so its shape reads at a glance, with a sheen from the top left.
      const P = (p: P3) => project(rotate(p, yaw, pitch));
      const landIn = easeOut(clamp(reveal / 0.6, 0, 1));
      const landPath = (c: CanvasRenderingContext2D) => {
        c.beginPath();
        for (const poly of polys) {
          poly.forEach((p, i) => {
            const q = P(p);
            if (i) c.lineTo(q.sx, q.sy);
            else c.moveTo(q.sx, q.sy);
          });
          c.closePath();
        }
      };
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.lineJoin = 'round';
      lctx.lineWidth = 0.6;

      // The slab: the land's silhouette in deep olive, stacked a few pixels towards the lower right.
      lctx.clearRect(0, 0, W, H);
      landPath(lctx);
      lctx.fillStyle = lctx.strokeStyle = 'rgb(30,42,20)';
      lctx.fill();
      lctx.stroke();
      const depth = Math.max(3, Math.round(R * 0.028));
      ctx.globalAlpha = landIn;
      ctx.save();
      ctx.shadowColor = 'rgba(27,30,28,0.32)';
      ctx.shadowBlur = R * 0.06;
      ctx.shadowOffsetX = R * 0.025;
      ctx.shadowOffsetY = R * 0.045;
      ctx.drawImage(landLayer, depth * 0.55, depth, W, H);
      ctx.restore();
      for (let k = depth - 1; k >= 1; k--) ctx.drawImage(landLayer, k * 0.55, k, W, H);

      // The top face.
      lctx.clearRect(0, 0, W, H);
      const qn = P(north);
      const qs = P(southEnd);
      const fern = lctx.createLinearGradient(qn.sx, qn.sy, qs.sx, qs.sy);
      for (const [pos, r, gr, b] of LAND) fern.addColorStop(pos, `rgb(${r},${gr},${b})`);
      landPath(lctx);
      lctx.fillStyle = lctx.strokeStyle = fern;
      lctx.fill();
      lctx.stroke();
      lctx.globalCompositeOperation = 'source-atop';
      const sheen = lctx.createLinearGradient(qn.sx - R * 0.4, qn.sy, qs.sx + R * 0.4, qs.sy);
      sheen.addColorStop(0, 'rgba(255,255,255,0.24)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(255,255,255,0.08)');
      lctx.fillStyle = sheen;
      lctx.fillRect(0, 0, W, H);
      lctx.globalCompositeOperation = 'source-over';
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
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(245,250,232,${landIn})`;
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
        // Quiet: hairlines, barely there; the office's links a touch clearer.
        ctx.lineWidth = l.hub ? 0.7 : 0.5;
        ctx.strokeStyle = l.hub ? 'rgba(232,242,196,0.32)' : 'rgba(214,232,150,0.14)';
        ctx.stroke();
      }
      for (const n of nodes) {
        const t = clamp((reveal - n.delay - 0.2) / 0.3, 0, 1);
        if (t <= 0) continue;
        const q = P(n);
        // Small points, no glow halos (they read as flashes).
        const r = (0.9 + 0.3 * n.south) * q.f;
        ctx.fillStyle = `rgba(240,247,220,${0.55 * t})`;
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

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

    // Ambient light: a second canvas above the globe (so the heavy drawing above is not redone every frame) with a
    // few slow, quiet effects: a faint lime glow that breathes very slowly, a soft sweep of light every 16 s and one
    // faint ring that spreads from the office. No twinkles or moving streaks. Only runs while the globe is on screen;
    // with reduced motion it stays a still frame.
    const fx = document.createElement('canvas');
    fx.className = 'pt-globe pt-globe-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.style.pointerEvents = 'none';
    inner.insertBefore(fx, pin);
    const fctx = fx.getContext('2d')!;
    let fxOn = false;
    let fxRaf = 0;
    const fxDraw = (now: number) => {
      fxRaf = 0;
      if (fx.width !== canvas.width || fx.height !== canvas.height) {
        fx.width = canvas.width;
        fx.height = canvas.height;
      }
      const t = reduced ? 2 : now / 1000;
      const yaw = view.yaw;
      const pitch = view.pitch;
      const R = scale * CAMERA / Math.sqrt(CAMERA * CAMERA - 1);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, H);
      const a = 0.25 + 0.75 * reveal;
      fctx.save();
      fctx.beginPath();
      fctx.arc(ox, oy, R * 0.995, 0, Math.PI * 2);
      fctx.clip();
      fctx.globalCompositeOperation = 'lighter';

      // A breathing lime glow low on the left and a paler one high on the right (the empty sides of the card).
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.35);
      const g1 = fctx.createRadialGradient(ox - R * 0.55, oy + R * 0.35, 0, ox - R * 0.55, oy + R * 0.35, R * 0.75);
      g1.addColorStop(0, `rgba(158,188,58,${(0.05 + 0.05 * breathe) * a})`);
      g1.addColorStop(1, 'rgba(158,188,58,0)');
      fctx.fillStyle = g1;
      fctx.fillRect(0, 0, W, H);
      const g2 = fctx.createRadialGradient(ox + R * 0.5, oy - R * 0.45, 0, ox + R * 0.5, oy - R * 0.45, R * 0.7);
      g2.addColorStop(0, `rgba(235,244,205,${(0.05 + 0.05 * (1 - breathe)) * a})`);
      g2.addColorStop(1, 'rgba(235,244,205,0)');
      fctx.fillStyle = g2;
      fctx.fillRect(0, 0, W, H);

      // A soft diagonal sweep of light, crossing the ball every ~9 s.
      const sw = ((t % 16) / 16) * 2.6 - 0.8;
      const cx = ox + (sw - 0.5) * R * 2;
      const sweep = fctx.createLinearGradient(cx - R * 0.35, oy - R * 0.35, cx + R * 0.35, oy + R * 0.35);
      sweep.addColorStop(0, 'rgba(255,255,255,0)');
      sweep.addColorStop(0.5, `rgba(255,255,255,${0.07 * a})`);
      sweep.addColorStop(1, 'rgba(255,255,255,0)');
      fctx.fillStyle = sweep;
      fctx.fillRect(0, 0, W, H);

      // Rings spreading from the office, three at a time, one every 1.6 s.
      const pq = project(rotate(pinPoint, yaw, pitch));
      for (let i = 0; i < 1; i++) {
        const ph = (t / 7) % 1;
        const r = R * (0.08 + 0.95 * ph);
        fctx.beginPath();
        fctx.arc(pq.sx, pq.sy, r, 0, Math.PI * 2);
        fctx.lineWidth = 0.8;
        fctx.strokeStyle = `rgba(214,232,150,${0.16 * (1 - ph) * (1 - ph) * a})`;
        fctx.stroke();
      }

      fctx.restore();
      if (fxOn && !reduced) fxRaf = requestAnimationFrame(fxDraw);
    };
    let inView = false;
    const fxSet = (on: boolean) => {
      inView = on;
      fxOn = inView && !document.hidden;
      if (fxOn && !fxRaf) fxRaf = requestAnimationFrame(fxDraw);
    };
    new IntersectionObserver((entries) => fxSet(entries.some((e) => e.isIntersecting))).observe(map);
    document.addEventListener('visibilitychange', () => fxSet(inView));

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
