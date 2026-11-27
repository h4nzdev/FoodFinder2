import axios from 'axios';

// All Groq configuration comes from environment variables only (.env.local)
const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL;
const MAX_CANDIDATES = 40;

function toRad(value) {
  return (value * Math.PI) / 180;
}

export function distanceKm(aLat, aLon, bLat, bLon) {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Keep the prompt small: send only the nearest restaurants (verified menus first on ties)
function buildCandidates(restaurants, origin) {
  return restaurants
    .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon))
    .map((r) => ({
      r,
      km: origin ? distanceKm(origin.lat, origin.lon, r.lat, r.lon) : null,
    }))
    .sort((a, b) => {
      if (a.km !== null && b.km !== null) return a.km - b.km;
      return (b.r.minPrice != null) - (a.r.minPrice != null);
    })
    .slice(0, MAX_CANDIDATES);
}

const SYSTEM_PROMPT = `You are "SugBot", a friendly, concise food guide inside FoodFinder, a Cebu City restaurant map.
Only recommend restaurants from the CANDIDATES list provided (use their exact "id"). Never invent places.
Prices are in Philippine Peso (₱). Respect budget, cuisine, distance, and mood hints from the user.
If the user is just chatting, reply briefly and you may return an empty recommendations array.
Respond ONLY with a JSON object of this exact shape:
{"message": "short friendly reply (max 2 sentences)",
 "recommendations": [{"id": "candidate id", "reason": "max 14 words why it fits", "highlight": "short tag e.g. 'Budget pick' or 'Closest'"}],
 "suggestions": ["up to 3 short follow-up prompts the user could tap"]}
Return at most 3 recommendations.`;

const LANGUAGE_RULES = {
  bisaya:
    'LANGUAGE: Reply in natural conversational Cebuano/Bisaya (e.g. "Kani nindot!", "Duol ra ni nimo", "Barato ra"). The "message", "reason", "highlight", and "suggestions" must all be in Bisaya. Keep restaurant names unchanged.',
  english: 'LANGUAGE: Reply in simple, friendly English.',
};

export async function askFoodBot({ history, restaurants, origin, language = 'bisaya', signal }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || !GROQ_URL || !GROQ_MODEL) {
    throw new Error('Missing VITE_GROQ_API_KEY, VITE_GROQ_API_URL, or VITE_GROQ_MODEL in .env.local.');
  }

  const candidates = buildCandidates(restaurants, origin);
  const byId = new Map(candidates.map(({ r }) => [String(r.id), r]));
  const kmById = new Map(candidates.map(({ r, km }) => [String(r.id), km]));

  const candidateText = JSON.stringify(
    candidates.map(({ r, km }) => ({
      id: String(r.id),
      name: r.name,
      category: r.category,
      cuisine: r.cuisine || undefined,
      address: r.address || undefined,
      priceFrom: r.minPrice ?? undefined,
      priceTo: r.maxPrice ?? undefined,
      hasMenu: Boolean(r.hasMenu || r.minPrice != null),
      km: km !== null ? Number(km.toFixed(2)) : undefined,
    }))
  );

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: LANGUAGE_RULES[language] || LANGUAGE_RULES.bisaya },
        {
          role: 'system',
          content: `User location: ${
            origin ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}` : 'unknown'
          }\nCANDIDATES: ${candidateText}`,
        },
        ...history.slice(-8).map(({ role, content }) => ({ role, content })),
      ],
    },
    {
      signal,
      timeout: 20000,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    }
  );

  let parsed = {};
  try {
    parsed = JSON.parse(response.data?.choices?.[0]?.message?.content || '{}');
  } catch {
    parsed = { message: 'Sorry, I could not understand that. Try again?' };
  }

  const recommendations = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
    .map((rec) => {
      const restaurant = byId.get(String(rec.id));
      if (!restaurant) return null;
      return {
        restaurant,
        reason: String(rec.reason || ''),
        highlight: String(rec.highlight || ''),
        km: kmById.get(String(rec.id)),
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    message: String(parsed.message || 'Here is what I found.'),
    recommendations,
    suggestions: (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .map(String)
      .slice(0, 3),
  };
}
