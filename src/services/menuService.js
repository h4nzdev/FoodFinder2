import { supabase } from '../lib/supabase';
import { formatPeso, listingId, restaurantIdentity } from '../utils/restaurantNormalizer';
import { CEBU_VERIFIED_RESTAURANTS } from '../data/cebuVerifiedDirectory';

const publishedMenuCatalogCache = {
  catalog: new Map(),
  timestamp: 0,
};

export function summarizeMenuPrices(items = []) {
  const validDishes = (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: item?.id || item?.name,
      name: String(item?.name || '').trim(),
      category: String(item?.category || '').trim(),
      description: String(item?.description || '').trim(),
      price: Number(item?.price),
      available: item?.available !== false,
    }))
    .filter((item) => item.name && Number.isFinite(item.price) && item.price >= 0);

  if (validDishes.length === 0) {
    return {
      dishes: [],
      minPrice: null,
      maxPrice: null,
      avgPrice: null,
      priceRangeLabel: '',
    };
  }

  const prices = validDishes.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const priceRangeLabel =
    minPrice === maxPrice
      ? formatPeso(minPrice)
      : `${formatPeso(minPrice)} – ${formatPeso(maxPrice)}`;

  return {
    dishes: validDishes,
    minPrice,
    maxPrice,
    avgPrice,
    priceRangeLabel,
  };
}

export async function fetchPublishedMenu(restaurantId, signal) {
  const builtinMatch = CEBU_VERIFIED_RESTAURANTS.find((r) => r.id === restaurantId);
  const identity = restaurantIdentity(restaurantId);
  if (!supabase || !identity) {
    return builtinMatch
      ? {
          items: builtinMatch.items,
          published_at: '2026-11-27T00:00:00Z',
          restaurant_osm_type: builtinMatch.osmType,
          restaurant_osm_id: builtinMatch.osmId,
        }
      : null;
  }

  try {
    const query = supabase
      .from('published_restaurant_menus')
      .select('items, published_at, restaurant_osm_type, restaurant_osm_id')
      .match(identity);

    if (signal) query.abortSignal(signal);
    const { data, error } = await query.maybeSingle();
    if (!error && data) return data;
  } catch {
    /* Fall back to verified directory if offline or not yet seeded */
  }

  return builtinMatch
    ? {
        items: builtinMatch.items,
        published_at: '2026-11-27T00:00:00Z',
        restaurant_osm_type: builtinMatch.osmType,
        restaurant_osm_id: builtinMatch.osmId,
      }
    : null;
}

export function getBuiltinMenusCatalog() {
  const catalog = new Map();
  for (const entry of CEBU_VERIFIED_RESTAURANTS) {
    catalog.set(entry.id, {
      ...summarizeMenuPrices(entry.items),
      publishedAt: '2026-11-27T00:00:00Z',
    });
  }
  return catalog;
}

export async function fetchPublishedMenusCatalog(signal, forceRefresh = false) {
  const catalog = getBuiltinMenusCatalog();
  if (!supabase) return catalog;

  if (
    !forceRefresh &&
    Date.now() - publishedMenuCatalogCache.timestamp < 60 * 1000 &&
    publishedMenuCatalogCache.catalog.size > 0
  ) {
    return publishedMenuCatalogCache.catalog;
  }

  try {
    const query = supabase
      .from('published_restaurant_menus')
      .select('restaurant_osm_type, restaurant_osm_id, items, published_at');

    if (signal) query.abortSignal(signal);
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const id = listingId(row);
        if (!id) continue;
        catalog.set(id, {
          ...summarizeMenuPrices(row.items),
          publishedAt: row.published_at,
        });
      }
    }
  } catch {
    /* Return built-in verified catalog on network failure */
  }

  publishedMenuCatalogCache.catalog = catalog;
  publishedMenuCatalogCache.timestamp = Date.now();
  return catalog;
}

export async function fetchPublishedMenuIds(signal, forceRefresh = false) {
  const catalog = await fetchPublishedMenusCatalog(signal, forceRefresh);
  return new Set(catalog.keys());
}

export function invalidatePublishedMenuCache() {
  publishedMenuCatalogCache.timestamp = 0;
}

export async function fetchDraftMenuItems(claimId, signal) {
  if (!supabase || !claimId) return [];
  const query = supabase
    .from('restaurant_menu_drafts')
    .select('*')
    .eq('claim_id', claimId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveDraftMenuItem(claimId, item) {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (!claimId) throw new Error('An approved claim is required.');

  const payload = {
    name: String(item.name || '').trim(),
    category: String(item.category || '').trim(),
    description: String(item.description || '').trim(),
    price: Number(item.price),
    image_url: item.image_url?.trim() || null,
    available: Boolean(item.available ?? true),
  };

  if (!payload.name) throw new Error('Enter a dish name.');
  if (!payload.category) throw new Error('Enter a menu category.');
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new Error('Enter a valid price in Philippine Pesos.');
  }
  if (payload.image_url && !/^https:\/\/\S+$/i.test(payload.image_url)) {
    throw new Error('Photo URL must be a valid https:// address.');
  }

  const query = item.id
    ? supabase
        .from('restaurant_menu_drafts')
        .update(payload)
        .eq('id', item.id)
        .eq('claim_id', claimId)
    : supabase
        .from('restaurant_menu_drafts')
        .insert({ ...payload, claim_id: claimId });

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function deleteDraftMenuItem(claimId, itemId) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('restaurant_menu_drafts')
    .delete()
    .eq('id', itemId)
    .eq('claim_id', claimId)
    .select('id')
    .single();

  if (error) throw error;
}

export async function setRestaurantMenuPublished(claimId, publishMenu) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.rpc('set_restaurant_menu_published', {
    target_claim: claimId,
    publish_menu: Boolean(publishMenu),
  });
  if (error) throw error;
  invalidatePublishedMenuCache();
}

export async function uploadMenuImage(claimId, file) {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (!claimId) throw new Error('Select an approved restaurant claim first.');
  if (!file) throw new Error('Choose an image file to upload.');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, WebP, or AVIF image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be 5 MB or less.');
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .slice(0, 40) || 'dish';
  const filePath = `${claimId}/${Date.now()}-${safeBase}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')
        ? 'Storage bucket "menu-images" is not set up yet. Apply the storage SQL migration or paste a direct https:// image URL.'
        : uploadError.message
    );
  }

  const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Could not resolve the public URL for the uploaded image.');
  }
  return data.publicUrl;
}
