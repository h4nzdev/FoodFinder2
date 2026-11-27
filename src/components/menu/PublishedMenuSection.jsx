import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { fetchPublishedMenu } from '../../services/menuService';
import { formatPeso } from '../../utils/restaurantNormalizer';
import ImageWithFallback from '../common/ImageWithFallback';
import { RestaurantMenuIllustration } from '../../assets/illustrations/EditorialIllustrations';

export default function PublishedMenuSection({ restaurant, compact = false }) {
  const [state, setState] = useState({
    restaurantId: null,
    menu: null,
    loading: true,
    error: '',
  });
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (!restaurant?.id) return;
    const controller = new AbortController();

    setState({
      restaurantId: restaurant.id,
      menu: null,
      loading: true,
      error: '',
    });

    fetchPublishedMenu(restaurant.id, controller.signal)
      .then((menuData) => {
        if (controller.signal.aborted) return;
        setState({
          restaurantId: restaurant.id,
          menu: menuData,
          loading: false,
          error: '',
        });
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return;
        setState({
          restaurantId: restaurant.id,
          menu: null,
          loading: false,
          error: 'Could not retrieve the verified menu record.',
        });
      });

    return () => controller.abort();
  }, [restaurant?.id, attempt]);

  const groupedCategories = useMemo(() => {
    const items = Array.isArray(state.menu?.items) ? state.menu.items : [];
    const groups = new Map();

    for (const rawItem of items) {
      if (!rawItem || !rawItem.name) continue;
      const category = (rawItem.category || 'House Dishes').trim();
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push({
        id: rawItem.id || `${category}-${rawItem.name}`,
        name: rawItem.name,
        description: rawItem.description || '',
        price: Number(rawItem.price) || 0,
        imageUrl: rawItem.imageUrl || rawItem.image_url || null,
        available: rawItem.available !== false,
      });
    }

    return [...groups.entries()];
  }, [state.menu]);

  const externalMenuLink = restaurant?.menuUrl || null;
  const officialWebsite = restaurant?.website || null;
  const selectedCategory = selection?.restaurantId === restaurant?.id &&
    groupedCategories.some(([name]) => name === selection.category)
    ? selection.category
    : groupedCategories[0]?.[0];

  return (
    <div className="published-menu-container">
      {(externalMenuLink || officialWebsite) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: 'var(--rule-thin)',
          }}
        >
          {externalMenuLink && (
            <a
              href={externalMenuLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial btn-sm"
            >
              <ExternalLink size={13} aria-hidden="true" />
              <span>External Menu Website</span>
            </a>
          )}
          {officialWebsite && officialWebsite !== externalMenuLink && (
            <a
              href={officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial btn-editorial-ghost btn-sm"
            >
              <ExternalLink size={13} aria-hidden="true" />
              <span>Official Website</span>
            </a>
          )}
        </div>
      )}

      {state.loading && (
        <div className="editorial-empty-state" role="status">
          <p className="editorial-kicker">Checking Verified Kitchen Records…</p>
        </div>
      )}

      {!state.loading && state.error && (
        <div className="editorial-empty-state" role="alert">
          <p className="editorial-empty-title">Unable to Load Menu</p>
          <p className="editorial-empty-copy">{state.error}</p>
          <button
            type="button"
            className="btn-editorial btn-sm"
            onClick={() => setAttempt((prev) => prev + 1)}
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {!state.loading && !state.error && groupedCategories.length === 0 && (
        <div className="editorial-empty-state">
          <RestaurantMenuIllustration size={compact ? 64 : 84} />
          <h3 className="editorial-empty-title">Menu currently unavailable.</h3>
          <p className="editorial-empty-copy">
            No verified owner menu has been published for {restaurant?.name || 'this establishment'} yet.
            FoodFinder never displays fabricated or unverified dish prices.
          </p>
        </div>
      )}

      {!state.loading && !state.error && groupedCategories.length > 0 && (
        <div className="menu-sections">
          <div className="menu-publication">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Verified menu · Philippine pesos (₱)</span>
            </span>
            {state.menu?.published_at && (
              <span style={{ color: 'var(--color-secondary)' }}>
                Updated {new Date(state.menu.published_at).toLocaleDateString('en-PH')}
              </span>
            )}
          </div>

          {!compact && groupedCategories.length > 1 && (
            <label className="menu-category-picker">
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  const sections = event.currentTarget.closest('.menu-sections');
                  if (sections.getBoundingClientRect().top < 0) sections.scrollIntoView({ block: 'start' });
                  setSelection({ restaurantId: restaurant.id, category: event.target.value });
                }}
              >
                {groupedCategories.map(([name, dishes]) => (
                  <option key={name} value={name}>{name} ({dishes.length})</option>
                ))}
              </select>
            </label>
          )}

          {groupedCategories.map(([categoryName, dishes]) => (
            <section key={categoryName} className="menu-category-chapter" aria-label={categoryName}
              data-selected={selectedCategory === categoryName}>
              <div className="menu-chapter-header">
                <h3 className="menu-chapter-title">{categoryName}</h3>
                <span className="menu-chapter-count">
                  {dishes.length} {dishes.length === 1 ? 'Dish' : 'Dishes'}
                </span>
              </div>

              <div className="editorial-menu-items-grid">
                {dishes.map((dish) => (
                  <article key={dish.id} className="editorial-dish-row">
                    <div className="editorial-dish-photo-frame">
                      <ImageWithFallback
                        src={dish.imageUrl}
                        alt={dish.name}
                        size={compact ? 36 : 44}
                      />
                    </div>

                    <div>
                      <div className="editorial-dish-topline">
                        <h4 className="editorial-dish-name">{dish.name}</h4>
                        <span className="editorial-dish-leader" aria-hidden="true" />
                        <span className="editorial-dish-price">{formatPeso(dish.price)}</span>
                      </div>

                      {dish.description && (
                        <p className="editorial-dish-description">{dish.description}</p>
                      )}

                      <span
                        className={`editorial-dish-availability ${
                          dish.available ? 'available' : 'unavailable'
                        }`}
                      >
                        {dish.available ? 'Available' : 'Currently Unavailable'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
