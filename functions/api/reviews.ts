/**
 * Cloudflare Pages Function: GET /api/reviews
 *
 * Returns the Google Business rating, the number of reviews and up to 5 reviews (Google's limit for the Places
 * API), trimmed to what the home page shows. The key never reaches the browser: it lives in the Cloudflare Pages
 * environment variables (GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID).
 * The answer is cached for a short time at the edge (Google's terms limit how long review content may be kept).
 */

interface Env {
  GOOGLE_PLACES_API_KEY?: string;
  GOOGLE_PLACE_ID?: string;
}

interface PlaceReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface PlaceResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
}

const CACHE_SECONDS = 3600;
const MAX_TEXT = 600;

const json = (body: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ? `public, max-age=300, s-maxage=${CACHE_SECONDS}` : 'no-store',
    },
  });

export const onRequestGet = async ({
  request,
  env,
  waitUntil,
}: {
  request: Request;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}) => {
  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) {
    return json({ message: 'As avaliações ainda não estão configuradas.' }, 503);
  }

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(new URL('/api/reviews', request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=pt-PT`,
    {
      headers: {
        'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask':
          'rating,userRatingCount,googleMapsUri,reviews.rating,reviews.relativePublishTimeDescription,reviews.text,reviews.originalText,reviews.authorAttribution',
      },
    },
  ).catch(() => null);

  if (!res || !res.ok) return json({ message: 'Não foi possível obter as avaliações.' }, 502);

  const data = (await res.json()) as PlaceResponse;
  const body = {
    rating: typeof data.rating === 'number' ? data.rating : null,
    count: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
    url: data.googleMapsUri ?? null,
    reviews: (data.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? '',
        authorUrl: r.authorAttribution?.uri ?? null,
        photo: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 0,
        when: r.relativePublishTimeDescription ?? '',
        text: (r.text?.text ?? r.originalText?.text ?? '').slice(0, MAX_TEXT),
      }))
      .filter((r) => r.author && r.rating > 0 && r.text),
  };

  const response = json(body, 200, true);
  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};
