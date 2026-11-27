import { supabase } from '../lib/supabase';
import { listingId, restaurantIdentity } from '../utils/restaurantNormalizer';
import { isInCebuCity } from '../data/cebuCity';

const CLAIM_FIELDS =
  'id, restaurant_name, restaurant_osm_type, restaurant_osm_id, status, address, latitude, longitude, created_at';

export function formatAuthError(error) {
  if (!error) return 'An unexpected error occurred.';
  if (error.code === 'invalid_credentials') {
    return 'Incorrect email or password. Create an owner account first if you are new to FoodFinder.';
  }
  if (error.code === 'email_not_confirmed') {
    return 'Please confirm your email address using the link sent by Supabase before signing in.';
  }
  return error.message || 'Authentication request failed.';
}

export async function signInOwner({ email, password }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function registerOwner({ email, password, fullName }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/owner`,
      data: {
        account_type: 'owner',
        full_name: fullName?.trim() || '',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutOwner() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchOwnerClaims(userId, signal) {
  if (!supabase || !userId) return [];
  const query = supabase
    .from('restaurant_claims')
    .select(CLAIM_FIELDS)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function submitOsmClaim({ restaurantId, restaurantName, evidence }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const identity = restaurantIdentity(restaurantId);
  if (!identity || identity.restaurant_osm_type === 'foodfinder') {
    throw new Error('A valid OpenStreetMap restaurant identifier is required.');
  }
  const cleanEvidence = String(evidence || '').trim();
  if (cleanEvidence.length < 20) {
    throw new Error('Ownership evidence must be at least 20 characters.');
  }

  const { data, error } = await supabase
    .from('restaurant_claims')
    .insert({
      ...identity,
      restaurant_name: String(restaurantName || '').trim(),
      evidence: cleanEvidence,
    })
    .select(CLAIM_FIELDS)
    .single();

  if (error) throw error;
  return data;
}

export async function submitNewRestaurantListing({
  name,
  evidence,
  address,
  latitude,
  longitude,
}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const lat = Number(latitude);
  const lon = Number(longitude);
  const cleanAddress = String(address || '').trim();
  if (!cleanAddress || !isInCebuCity(lat, lon)) {
    throw new Error('Enter a street address and coordinates inside Cebu City.');
  }

  const { data, error } = await supabase.rpc('submit_restaurant_listing', {
    listing_name: String(name || '').trim(),
    listing_evidence: String(evidence || '').trim(),
    listing_address: cleanAddress,
    listing_latitude: lat,
    listing_longitude: lon,
  });

  if (error) throw error;
  return data;
}

export async function publishRestaurantLocation({
  claimId,
  address,
  latitude,
  longitude,
}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const lat = Number(latitude);
  const lon = Number(longitude);
  const cleanAddress = String(address || '').trim();
  if (!cleanAddress || !isInCebuCity(lat, lon)) {
    throw new Error('Enter a street address and coordinates inside Cebu City.');
  }

  const { error } = await supabase.rpc('publish_restaurant_location', {
    target_claim: claimId,
    listing_address: cleanAddress,
    listing_latitude: lat,
    listing_longitude: lon,
  });

  if (error) throw error;
}

export async function checkIsReviewer(userId, signal) {
  if (!supabase || !userId) return false;
  const query = supabase
    .from('restaurant_claim_reviewers')
    .select('user_id')
    .eq('user_id', userId);

  if (signal) query.abortSignal(signal);
  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return Boolean(data?.user_id);
}

export async function fetchPendingClaimsForReview(userId, signal) {
  if (!supabase || !userId) return [];
  const isReviewer = await checkIsReviewer(userId, signal);
  if (!isReviewer) return null;

  const query = supabase
    .from('restaurant_claims')
    .select(`${CLAIM_FIELDS}, evidence, owner_id`)
    .eq('status', 'pending')
    .neq('owner_id', userId)
    .order('created_at', { ascending: true });

  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function decideClaim(claimId, decision) {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Invalid review decision.');
  }

  const { data, error } = await supabase
    .from('restaurant_claims')
    .update({ status: decision })
    .eq('id', claimId)
    .eq('status', 'pending')
    .select('id, status')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchPublishedLocations(signal, restaurantId = null) {
  if (!supabase) return [];
  const identity = restaurantId ? restaurantIdentity(restaurantId) : null;
  if (restaurantId && !identity) return [];

  const query = supabase
    .from('published_restaurant_locations')
    .select('restaurant_osm_type, restaurant_osm_id, restaurant_name, address, latitude, longitude');

  if (identity) query.match(identity);
  if (signal) query.abortSignal(signal);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => ({
    id: listingId(row),
    osmType: row.restaurant_osm_type,
    osmId: row.restaurant_osm_id,
    name: row.restaurant_name,
    lat: row.latitude,
    lon: row.longitude,
    address: row.address,
    category: 'Restaurant',
    ownerLocation: true,
  }));
}
