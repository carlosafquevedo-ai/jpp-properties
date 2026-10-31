import type { ZoneId } from '../data/properties';

/**
 * Property location from the Google Maps link the team pastes in Sanity ("Link do Google Maps"). The link only gives
 * the point; the map itself is drawn from OpenStreetMap tiles (no Google iframe: it would set cookies before
 * consent, and needs no API key). Everything runs at build time, so the page ships plain images.
 */

export type LatLng = { lat: number; lng: number };

const valid = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Coordinates from a full Google Maps URL. Handles the place marker ("!3d<lat>!4d<lng>", the most precise), the
 * camera ("@<lat>,<lng>,<zoom>z") and query forms ("?q=", "?ll=", "query=", "destination="). Returns null for
 * anything else, including a short link that has not been resolved yet.
 */
export function parseMapsUrl(url: string): LatLng | null {
  const text = decodeURIComponent(url);
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|ll|query|destination|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && valid(Number(m[1]), Number(m[2]))) return { lat: Number(m[1]), lng: Number(m[2]) };
  }
  return null;
}

/**
 * Coordinates from any Google Maps link, short ones included ("maps.app.goo.gl/…", "goo.gl/maps/…"): those are
 * followed to the full URL at build time. Returns null when the link carries no point (e.g. a plain search).
 */
export async function resolveMapsUrl(url: string): Promise<LatLng | null> {
  const direct = parseMapsUrl(url);
  if (direct) return direct;
  let next = url;
  try {
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetch(next, { redirect: 'manual' });
      const location = res.headers.get('location');
      if (!location) break;
      next = new URL(location, next).toString();
      const found = parseMapsUrl(next);
      if (found) return found;
    }
  } catch {
    // Offline build or Google unreachable: the page falls back to the zone.
  }
  return null;
}

/**
 * Centre of each zone, for listings without a map link yet: the map then shows the area, not a house.
 * TODO: in Sanity each zone document gets its own point; these are the town centres.
 */
export const zoneCentres: Record<ZoneId, LatLng> = {
  vilamoura: { lat: 37.0784, lng: -8.1189 },
  quarteira: { lat: 37.0693, lng: -8.1004 },
  vilasol: { lat: 37.0956, lng: -8.0848 },
  'vale-do-lobo': { lat: 37.0506, lng: -8.0627 },
  'quinta-do-lago': { lat: 37.0436, lng: -8.0266 },
  loule: { lat: 37.1377, lng: -8.0197 },
};

const TILE = 256;

/** Web-Mercator pixel position of a point at a zoom level (OpenStreetMap tile scheme). */
export function toPixels({ lat, lng }: LatLng, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const s = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale,
  };
}

/**
 * The tiles that cover a box of `halfW` × `halfH` px around a point, each with its offset from the point (so the
 * page can centre the point with `left: calc(50% + dx)`).
 */
export function tilesAround(point: LatLng, zoom: number, halfW: number, halfH: number) {
  const { x, y } = toPixels(point, zoom);
  const max = 2 ** zoom;
  const tiles: { src: string; dx: number; dy: number }[] = [];
  for (let ty = Math.floor((y - halfH) / TILE); ty <= Math.floor((y + halfH) / TILE); ty++) {
    if (ty < 0 || ty >= max) continue;
    for (let tx = Math.floor((x - halfW) / TILE); tx <= Math.floor((x + halfW) / TILE); tx++) {
      const wrapped = ((tx % max) + max) % max;
      tiles.push({
        src: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png`,
        dx: Math.round(tx * TILE - x),
        dy: Math.round(ty * TILE - y),
      });
    }
  }
  return tiles;
}

/** Metres per screen pixel at a latitude and zoom (for drawing an area of a given radius). */
export const metresPerPixel = (lat: number, zoom: number) =>
  (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

/** A Google Maps search link for a place name (used when the listing has no link of its own). */
export const googleSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
