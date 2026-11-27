import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, MapPin, Navigation, ShieldCheck } from 'lucide-react';

export default function RestaurantListItem({
  restaurant,
  index,
  isSelected,
  onSelect,
  onGetDirections,
}) {
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`editorial-restaurant-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(restaurant)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(restaurant);
        }
      }}
    >
      <span className="restaurant-index-num" aria-hidden="true">
        {indexLabel}
      </span>

      <div>
        <div className="restaurant-item-header">
          <h3 className="restaurant-item-title">{restaurant.name}</h3>

          <div className="restaurant-item-badges">
            {restaurant.hasPublishedMenu ? (
              <span className="editorial-tag editorial-tag-verified" title="Verified owner menu published">
                <ShieldCheck size={11} aria-hidden="true" />
                <span>Verified Menu</span>
              </span>
            ) : restaurant.hasExternalMenu ? (
              <span className="editorial-tag editorial-tag-menu-link" title="External menu link available">
                <ExternalLink size={11} aria-hidden="true" />
                <span>Menu Link</span>
              </span>
            ) : (
              <span className="editorial-tag" title="No verified menu published yet">
                <span>No Menu</span>
              </span>
            )}
          </div>
        </div>

        <div className="restaurant-item-meta">
          <span>{restaurant.category}</span>
          {restaurant.cuisine && (
            <>
              <span>·</span>
              <span>{restaurant.cuisine}</span>
            </>
          )}
          {restaurant.ownerLocation && (
            <>
              <span>·</span>
              <span>Owner Verified Location</span>
            </>
          )}
        </div>

        <p className="restaurant-item-address">
          <MapPin size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{restaurant.address || `${restaurant.lat.toFixed(4)}, ${restaurant.lon.toFixed(4)}`}</span>
        </p>

        <div
          className="restaurant-item-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="btn-editorial btn-editorial-ink btn-sm"
            onClick={() => {
              onSelect(restaurant);
              onGetDirections(restaurant);
            }}
          >
            <Navigation size={12} aria-hidden="true" />
            <span>Get Directions</span>
          </button>

          <Link
            to={`/restaurant/${restaurant.id}`}
            state={{ osmRestaurant: restaurant }}
            className="btn-editorial btn-sm"
          >
            <BookOpen size={12} aria-hidden="true" />
            <span>Menu &amp; Profile</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
