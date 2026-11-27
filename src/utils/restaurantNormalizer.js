const AMENITY_LABELS = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  fast_food: 'Fast Food',
};

export function sanitizeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function formatCuisineTag(rawCuisine) {
  if (typeof rawCuisine !== 'string' || !rawCuisine.trim()) return '';
  return rawCuisine
    .split(/[;,]/)
    .map((part) =>
      part
        .trim()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .filter(Boolean)
    .join(' · ');
}

export function extractCuisineList(rawCuisine) {
  if (typeof rawCuisine !== 'string' || !rawCuisine.trim()) return [];
  return rawCuisine
    .split(/[;,]/)
    .map((part) =>
      part
        .trim()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .filter(Boolean);
}

export function isValidCoordinate(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

export function isOsmRestaurantId(id) {
  return /^osm-(node|way|relation)-[1-9]\d{0,18}$/.test(String(id || ''));
}

export function restaurantIdentity(id) {
  if (typeof id !== 'string') return null;
  const ownerListing = /^owner-([1-9]\d{0,18})$/.exec(id);
  if (ownerListing) {
    return {
      restaurant_osm_type: 'foodfinder',
      restaurant_osm_id: ownerListing[1],
    };
  }
  const osmMatch = /^osm-(node|way|relation)-([1-9]\d{0,18})$/.exec(id);
  if (osmMatch) {
    return {
      restaurant_osm_type: osmMatch[1],
      restaurant_osm_id: osmMatch[2],
    };
  }
  return null;
}

export function listingId({ restaurant_osm_type, restaurant_osm_id }) {
  if (!restaurant_osm_type || !restaurant_osm_id) return '';
  return restaurant_osm_type === 'foodfinder'
    ? `owner-${restaurant_osm_id}`
    : `osm-${restaurant_osm_type}-${restaurant_osm_id}`;
}

export function normalizeRestaurants(elements = []) {
  const restaurants = new Map();

  for (const element of elements) {
    if (
      !element ||
      !['node', 'way', 'relation'].includes(element.type) ||
      !Number.isSafeInteger(element.id) ||
      element.id < 1
    ) {
      continue;
    }

    const tags = element.tags ?? {};
    const name = typeof tags.name === 'string' ? tags.name.trim() : '';
    const coords = element.type === 'node' ? element : element.center;
    const lat = Number(coords?.lat);
    const lon = Number(coords?.lon);

    if (!name || !Object.hasOwn(AMENITY_LABELS, tags.amenity) || !isValidCoordinate(lat, lon)) {
      continue;
    }

    const id = `osm-${element.type}-${element.id}`;
    if (restaurants.has(id)) continue;

    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const district = tags['addr:suburb'] || tags['addr:district'] || tags['addr:neighbourhood'] || tags['addr:barangay'];
    const city = tags['addr:city'] || tags['addr:town'] || tags['addr:municipality'] || 'Cebu City';
    const addressParts = [street, district, city].filter(Boolean);
    const address =
      tags['addr:full']?.trim() ||
      tags['addr:place']?.trim() ||
      (addressParts.length > 0 ? addressParts.join(', ') : '');

    const cuisine = formatCuisineTag(tags.cuisine);
    const cuisines = extractCuisineList(tags.cuisine);
    const menuUrl = sanitizeExternalUrl(tags['website:menu']);
    const website = sanitizeExternalUrl(tags.website) || sanitizeExternalUrl(tags['contact:website']);

    restaurants.set(id, {
      id,
      osmId: String(element.id),
      osmType: element.type,
      name,
      lat,
      lon,
      amenity: tags.amenity,
      category: AMENITY_LABELS[tags.amenity],
      cuisine,
      cuisines,
      address,
      city,
      phone: (tags['contact:phone'] || tags.phone || tags['contact:mobile'] || '').trim() || null,
      website,
      menuUrl,
      openingHours: tags.opening_hours?.trim() || null,
      description: tags.description?.trim() || null,
      hasPublishedMenu: false,
      hasExternalMenu: Boolean(menuUrl),
      ownerLocation: false,
    });
  }

  return [...restaurants.values()];
}

export function mergeRestaurantLocations(osmRestaurants = [], ownerLocations = [], publishedMenuIds = new Set()) {
  const listings = new Map();

  for (const restaurant of osmRestaurants) {
    listings.set(restaurant.id, {
      ...restaurant,
      hasPublishedMenu: publishedMenuIds.has(restaurant.id) || Boolean(restaurant.hasPublishedMenu),
      hasExternalMenu: Boolean(restaurant.menuUrl),
    });
  }

  for (const location of ownerLocations) {
    const existing = listings.get(location.id);
    if (existing) {
      listings.set(location.id, {
        ...existing,
        lat: location.lat,
        lon: location.lon,
        address: location.address || existing.address,
        ownerLocation: true,
        hasPublishedMenu: publishedMenuIds.has(location.id) || Boolean(existing.hasPublishedMenu),
      });
    } else if (isValidCoordinate(location.lat, location.lon)) {
      listings.set(location.id, {
        id: location.id,
        osmId: location.osmId || location.id.replace(/^owner-/, ''),
        osmType: location.osmType || 'foodfinder',
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        amenity: 'restaurant',
        category: location.category || 'Restaurant',
        cuisine: location.cuisine || '',
        cuisines: location.cuisines || [],
        address: location.address || 'Cebu City',
        city: 'Cebu City',
        phone: null,
        website: null,
        menuUrl: null,
        openingHours: null,
        description: null,
        ownerLocation: true,
        hasPublishedMenu: publishedMenuIds.has(location.id),
        hasExternalMenu: false,
      });
    }
  }

  return [...listings.values()];
}

export function formatPeso(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '₱0.00';
  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
