import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Navigation,
  Store,
  X,
} from 'lucide-react';
import PublishedMenuSection from '../menu/PublishedMenuSection';
import { isOsmRestaurantId } from '../../utils/restaurantNormalizer';

export default function SelectedRestaurantPanel({
  restaurant,
  onClose,
  onGetDirections,
  routingLoading,
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (!restaurant) return null;

  const canClaim = isOsmRestaurantId(restaurant.id);

  return (
    <section
      className="selected-restaurant-folio"
      aria-label={`Selected restaurant: ${restaurant.name}`}
    >
      <div className="folio-top-bar" style={{ marginBottom: collapsed ? 0 : '12px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="editorial-kicker">
            Selected · {restaurant.category}
          </span>
          <h2
            className="folio-title"
            style={{
              fontSize: collapsed ? '1.08rem' : '1.36rem',
              marginTop: '2px',
              whiteSpace: collapsed ? 'nowrap' : 'normal',
              overflow: collapsed ? 'hidden' : 'visible',
              textOverflow: collapsed ? 'ellipsis' : 'clip',
            }}
          >
            {restaurant.name}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="btn-editorial btn-sm"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand selected restaurant card' : 'Shrink selected restaurant card'}
            title={collapsed ? 'Expand card' : 'Shrink card'}
          >
            {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-editorial btn-editorial-ghost btn-sm"
            aria-label="Close selected restaurant drawer"
          >
            <X size={13} aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <p className="folio-subtitle">
            {restaurant.cuisine
              ? `${restaurant.category} · ${restaurant.cuisine}`
              : `${restaurant.category} · Cuisine not listed in OSM`}
          </p>

          {restaurant.description && (
            <p style={{ fontSize: '0.84rem', marginTop: '8px', color: 'var(--color-secondary)' }}>
              {restaurant.description}
            </p>
          )}

          <div className="folio-specs-table">
            <div className="folio-spec-row">
              <span className="folio-spec-label">Address</span>
              <span className="folio-spec-value">
                {restaurant.address || 'Not available in OpenStreetMap'}
              </span>
            </div>

            <div className="folio-spec-row">
              <span className="folio-spec-label">Opening Hours</span>
              <span className="folio-spec-value">
                {restaurant.openingHours || 'Not available'}
              </span>
            </div>

            <div className="folio-spec-row">
              <span className="folio-spec-label">Contact</span>
              <span className="folio-spec-value">
                {restaurant.phone || 'Not available'}
              </span>
            </div>

            <div className="folio-spec-row">
              <span className="folio-spec-label">Coordinates</span>
              <span className="folio-spec-value">
                {restaurant.lat.toFixed(5)}° N, {restaurant.lon.toFixed(5)}° E
              </span>
            </div>

            {restaurant.website && (
              <div className="folio-spec-row">
                <span className="folio-spec-label">Website</span>
                <span className="folio-spec-value">
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                    {restaurant.website}
                  </a>
                </span>
              </div>
            )}
          </div>

          <div className="folio-actions-bar">
            <button
              type="button"
              className="btn-editorial btn-editorial-ink"
              onClick={() => onGetDirections(restaurant)}
              disabled={routingLoading}
            >
              <Navigation size={14} aria-hidden="true" />
              <span>{routingLoading ? 'Calculating Route…' : 'Get Directions'}</span>
            </button>

            <Link
              to={`/restaurant/${restaurant.id}`}
              state={{ osmRestaurant: restaurant }}
              className="btn-editorial"
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>Full Menu Sheet</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>

            {canClaim && (
              <Link
                to={`/owner?claim=${restaurant.id}`}
                className="btn-editorial btn-editorial-ghost btn-sm"
              >
                <Store size={13} aria-hidden="true" />
                <span>Claim Listing</span>
              </Link>
            )}
          </div>

          <div style={{ borderTop: 'var(--rule-ink)', paddingTop: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <span className="editorial-kicker">Published Menu &amp; Prices</span>
            </div>
            <PublishedMenuSection restaurant={restaurant} compact />
          </div>
        </>
      )}
    </section>
  );
}
