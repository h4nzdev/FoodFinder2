import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Store,
} from 'lucide-react';
import { fetchOsmRestaurantById } from '../services/restaurantService';
import { fetchPublishedLocations } from '../services/ownerService';
import {
  isOsmRestaurantId,
  mergeRestaurantLocations,
  restaurantIdentity,
} from '../utils/restaurantNormalizer';
import { isInCebuCity } from '../data/cebuCity';
import PublishedMenuSection from '../components/menu/PublishedMenuSection';
import DiscoveryMap from '../components/map/DiscoveryMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouting } from '../hooks/useRouting';
import {
  PlateUtensilsIllustration,
  StorefrontIllustration,
} from '../assets/illustrations/EditorialIllustrations';

export default function RestaurantDetails() {
  const { id } = useParams();
  const location = useLocation();

  const passedRestaurant = location.state?.osmRestaurant;
  const validPassed =
    passedRestaurant?.id === id &&
    isInCebuCity(passedRestaurant.lat, passedRestaurant.lon)
      ? passedRestaurant
      : null;

  const [lookup, setLookup] = useState({
    id: validPassed ? id : null,
    restaurant: validPassed,
    loading: !validPassed,
    error: '',
  });
  const [attempt, setAttempt] = useState(0);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [expandedProfile, setExpandedProfile] = useState(null);

  const geolocation = useGeolocation();
  const routing = useRouting(geolocation);

  useEffect(() => {
    if (validPassed && attempt === 0) {
      setLookup({
        id,
        restaurant: validPassed,
        loading: false,
        error: '',
      });
      return;
    }

    const identity = restaurantIdentity(id);
    if (!identity) {
      setLookup({
        id,
        restaurant: null,
        loading: false,
        error: 'Invalid restaurant identifier.',
      });
      return;
    }

    const controller = new AbortController();
    setLookup((prev) => ({ ...prev, loading: true, error: '' }));

    Promise.allSettled([
      isOsmRestaurantId(id) ? fetchOsmRestaurantById(id, controller.signal) : Promise.resolve(null),
      fetchPublishedLocations(controller.signal, id),
    ]).then(([osmRes, ownerRes]) => {
      if (controller.signal.aborted) return;

      const osmItem = osmRes.status === 'fulfilled' ? osmRes.value : null;
      const ownerList = ownerRes.status === 'fulfilled' ? ownerRes.value : [];
      const [merged] = mergeRestaurantLocations(osmItem ? [osmItem] : [], ownerList);

      if (!merged) {
        setLookup({
          id,
          restaurant: null,
          loading: false,
          error:
            osmRes.status === 'rejected'
              ? 'Could not retrieve the restaurant profile from Overpass API.'
              : 'No matching Cebu City restaurant was found.',
        });
      } else {
        setLookup({
          id,
          restaurant: merged,
          loading: false,
          error: '',
        });
      }
    });

    return () => controller.abort();
  }, [attempt, id, validPassed]);

  const restaurant = lookup.restaurant;

  const handleTriggerDirections = () => {
    if (!restaurant) return;
    setShowRouteMap(true);
    routing.startNavigationTo(restaurant);
  };

  if (lookup.loading) {
    return (
      <div className="editorial-page-container">
        <div className="editorial-empty-state" role="status">
          <PlateUtensilsIllustration size={80} />
          <h1 className="editorial-empty-title">Loading Establishment Folio…</h1>
          <p className="editorial-empty-copy">
            Retrieving live OpenStreetMap and verified menu records for this Cebu City establishment.
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="editorial-page-container">
        <div className="editorial-empty-state" role="alert">
          <StorefrontIllustration size={84} />
          <h1 className="editorial-empty-title">Establishment Not Found</h1>
          <p className="editorial-empty-copy">
            {lookup.error || 'We could not find that Cebu City restaurant record.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setAttempt((prev) => prev + 1)}
              className="btn-editorial"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Retry</span>
            </button>
            <Link to="/" className="btn-editorial btn-editorial-ink">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Return to Discovery Map</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-page-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" className="btn-editorial btn-sm">
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Back to Cebu City Discovery Map</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-editorial btn-editorial-ink btn-sm"
            onClick={handleTriggerDirections}
          >
            <Navigation size={13} aria-hidden="true" />
            <span>{showRouteMap ? 'Recalculate Directions' : 'Get Directions (OSRM)'}</span>
          </button>

          {isOsmRestaurantId(restaurant.id) && (
            <Link
              to={`/owner?claim=${restaurant.id}`}
              className="btn-editorial btn-sm"
            >
              <Store size={13} aria-hidden="true" />
              <span>Claim Ownership</span>
            </Link>
          )}
        </div>
      </div>

      {/* Interactive OSRM Route Map Drawer when Directions are requested */}
      {showRouteMap && (
        <section
          className="editorial-card"
          style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}
          aria-label="Interactive Route Navigation Map"
        >
          <div
            style={{
              padding: '12px 18px',
              borderBottom: 'var(--rule-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-paper-alt)',
            }}
          >
            <span className="editorial-kicker">
              OSRM Road Navigation to {restaurant.name}
            </span>
            <button
              type="button"
              className="btn-editorial btn-sm"
              onClick={() => {
                routing.clearRoute();
                setShowRouteMap(false);
              }}
            >
              <span>Close Route Map</span>
            </button>
          </div>

          <div style={{ height: '440px', position: 'relative' }}>
            <DiscoveryMap
              restaurants={[restaurant]}
              selectedRestaurant={restaurant}
              onSelectRestaurant={() => {}}
              onBoundsChange={() => {}}
              geolocation={geolocation}
              routing={routing}
            />
          </div>
        </section>
      )}

      {/* Digital Restaurant Menu Broadsheet */}
      <article className="menu-broadsheet restaurant-menu-page">
        <div className="menu-broadsheet-inner-frame">
          <header className="menu-broadsheet-header">
            <div>
              <span className="editorial-kicker">
                {restaurant.category}
                {restaurant.cuisine ? ` · ${restaurant.cuisine}` : ''}
                {restaurant.ownerLocation ? ' · Verified Owner Location' : ' · OpenStreetMap Record'}
              </span>
              <h1 className="menu-broadsheet-title">{restaurant.name}</h1>
              {restaurant.description && (
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: '0.95rem',
                    color: 'var(--color-secondary)',
                    maxWidth: '640px',
                  }}
                >
                  {restaurant.description}
                </p>
              )}
            </div>

            <div className="menu-header-art">
              <PlateUtensilsIllustration size={68} />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
                REF: {restaurant.id.toUpperCase()}
              </span>
            </div>
          </header>

          {(restaurant.address || restaurant.openingHours || restaurant.phone || restaurant.menuUrl || restaurant.website) && (
            <button type="button" className="menu-details-toggle" aria-controls="restaurant-profile"
              aria-expanded={expandedProfile === id}
              onClick={() => setExpandedProfile(expandedProfile === id ? null : id)}>
              Restaurant details <ChevronDown size={16} aria-hidden="true" />
            </button>
          )}
          <div id="restaurant-profile" className="menu-broadsheet-meta-grid" data-expanded={expandedProfile === id}>
            <div className="menu-meta-cell" data-empty={!restaurant.address}>
              <span className="menu-meta-label">
                <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Street Address
              </span>
              <span className="menu-meta-value">
                {restaurant.address || 'Not available in OpenStreetMap'}
              </span>
            </div>

            <div className="menu-meta-cell" data-empty={!restaurant.openingHours}>
              <span className="menu-meta-label">
                <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Opening Hours
              </span>
              <span className="menu-meta-value">
                {restaurant.openingHours || 'Not available'}
              </span>
            </div>

            <div className="menu-meta-cell" data-empty={!restaurant.phone}>
              <span className="menu-meta-label">
                <Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Contact Number
              </span>
              <span className="menu-meta-value">
                {restaurant.phone || 'Not available'}
              </span>
            </div>

            <div className="menu-meta-cell" data-empty={!restaurant.menuUrl && !restaurant.website}>
              <span className="menu-meta-label">
                <Globe size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Website &amp; External Menu
              </span>
              <span className="menu-meta-value">
                {restaurant.menuUrl ? (
                  <a
                    href={restaurant.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    Open Menu Link <ExternalLink size={11} style={{ display: 'inline' }} />
                  </a>
                ) : restaurant.website ? (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    Visit Official Website <ExternalLink size={11} style={{ display: 'inline' }} />
                  </a>
                ) : (
                  'Not available'
                )}
              </span>
            </div>
          </div>

          {/* Verified Published Menu */}
          <section aria-label="Restaurant Menu">
            <PublishedMenuSection restaurant={restaurant} />
          </section>
        </div>
      </article>
    </div>
  );
}
