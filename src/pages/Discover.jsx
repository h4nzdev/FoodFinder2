import { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  List,
  Map as MapIcon,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useRestaurants } from '../hooks/useRestaurants';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouting } from '../hooks/useRouting';
import RestaurantListItem from '../components/restaurant/RestaurantListItem';
import SelectedRestaurantPanel from '../components/restaurant/SelectedRestaurantPanel';
import DiscoveryMap from '../components/map/DiscoveryMap';
import {
  CoffeeCupIllustration,
  FoodBowlIllustration,
  LocationPinIllustration,
  PlateUtensilsIllustration,
  StorefrontIllustration,
} from '../assets/illustrations/EditorialIllustrations';

const CATEGORIES = ['All', 'Restaurant', 'Café', 'Fast Food'];
const LIST_PAGE_SIZE = 40;

export default function Discover() {
  const {
    allRestaurants,
    filteredRestaurants,
    availableCuisines,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCuisine,
    setSelectedCuisine,
    onlyVerifiedMenus,
    setOnlyVerifiedMenus,
    onlyInMapView,
    setOnlyInMapView,
    updateMapBounds,
    resetFilters,
    retry,
  } = useRestaurants();

  const geolocation = useGeolocation();
  const routing = useRouting(geolocation);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [mobileMode, setMobileMode] = useState('split'); // 'split' | 'list' | 'map'
  const [visibleListLimit, setVisibleListLimit] = useState(LIST_PAGE_SIZE);

  useEffect(() => {
    setVisibleListLimit(LIST_PAGE_SIZE);
  }, [searchQuery, selectedCategory, selectedCuisine, onlyVerifiedMenus, onlyInMapView]);

  const displayedListRestaurants = filteredRestaurants.slice(0, visibleListLimit);
  const remainingListCount = Math.max(
    0,
    filteredRestaurants.length - displayedListRestaurants.length
  );

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (mobileMode === 'map') {
      setMobileMode('split');
    }
  };

  const handleGetDirections = (restaurant) => {
    setSelectedRestaurant(restaurant);
    routing.startNavigationTo(restaurant);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'All' ||
    selectedCuisine !== 'All' ||
    onlyVerifiedMenus;

  const MastheadIllustration =
    selectedCategory === 'Café'
      ? CoffeeCupIllustration
      : selectedCategory === 'Fast Food'
        ? FoodBowlIllustration
        : PlateUtensilsIllustration;

  return (
    <div className="discover-split-layout">
      {/* LEFT SECTION: Editorial Restaurant Discovery, Filters & Selected Restaurant Folio */}
      <section
        className={`discover-left-column mobile-mode-${mobileMode}`}
        aria-label="Restaurant Discovery Directory"
      >
        <div className="discover-editorial-masthead">
          <div>
            <span className="editorial-kicker">Cebu City Field Guide</span>
            <h1 className="discover-masthead-title">
              Local Tables, Menus &amp; Road Routes
            </h1>
            <p className="discover-masthead-sub">
              Live OpenStreetMap establishments, verified owner menus in ₱, and OSRM street directions.
            </p>
          </div>
          <div className="discover-masthead-art">
            <MastheadIllustration size={48} />
          </div>
        </div>

        {/* Search & Category Controls */}
        <div className="discover-controls-section">
          <div className="search-box-editorial">
            <Search size={16} className="search-box-icon" aria-hidden="true" />
            <input
              type="text"
              className="editorial-input"
              aria-label="Search restaurants, cuisines, or streets in Cebu City"
              placeholder="Search restaurant name, cuisine, or street…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div
            className="category-tabs-bar"
            role="tablist"
            aria-label="Establishment category filter"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                className={`category-tab-btn ${
                  selectedCategory === category ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'All' ? 'All Places' : category}
              </button>
            ))}
          </div>

          <div className="secondary-filters-row">
            <select
              aria-label="Filter by cuisine"
              className="cuisine-select-compact"
              value={selectedCuisine}
              onChange={(event) => setSelectedCuisine(event.target.value)}
            >
              <option value="All">All Cuisines</option>
              {availableCuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`filter-toggle-chip ${onlyVerifiedMenus ? 'active' : ''}`}
              aria-pressed={onlyVerifiedMenus}
              onClick={() => setOnlyVerifiedMenus((prev) => !prev)}
            >
              <ShieldCheck size={12} aria-hidden="true" />
              <span>Has Menu</span>
            </button>

            <button
              type="button"
              className={`filter-toggle-chip ${onlyInMapView ? 'active' : ''}`}
              aria-pressed={onlyInMapView}
              onClick={() => setOnlyInMapView((prev) => !prev)}
              title="Filter list by visible map boundaries"
            >
              <span>In Map Bounds</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="discover-status-bar" role="status" aria-live="polite">
          <span>
            {loading ? (
              'Retrieving Cebu City establishments from Overpass…'
            ) : (
              <>
                Matching{' '}
                <span className="status-count-strong">
                  {filteredRestaurants.length}
                </span>{' '}
                of {allRestaurants.length} establishments
              </>
            )}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn-editorial btn-sm"
              >
                <RotateCcw size={11} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={retry}
              disabled={loading}
              className="btn-editorial btn-editorial-ghost btn-sm"
              title="Refresh restaurant listings"
            >
              <RefreshCw size={11} aria-hidden="true" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Scrollable Left Pane: Selected Restaurant Folio + Editorial Directory List */}
        <div className="discover-scroll-pane">
          {selectedRestaurant && (
            <SelectedRestaurantPanel
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
              onGetDirections={handleGetDirections}
              routingLoading={routing.loading}
            />
          )}

          {error && (
            <div className="editorial-empty-state" role="alert" style={{ margin: '16px' }}>
              <LocationPinIllustration size={64} />
              <h2 className="editorial-empty-title">Overpass Connection Issue</h2>
              <p className="editorial-empty-copy">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="btn-editorial btn-editorial-ink"
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>Retry Request</span>
              </button>
            </div>
          )}

          {!loading && !error && filteredRestaurants.length === 0 && (
            <div className="editorial-empty-state" style={{ margin: '16px' }}>
              <StorefrontIllustration size={72} />
              <h2 className="editorial-empty-title">No Establishments in View</h2>
              <p className="editorial-empty-copy">
                No restaurants, cafés, or fast-food spots matched your current map
                boundaries and filters. Try zooming out on Cebu City or resetting filters.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn-editorial btn-editorial-ink"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Clear Filters</span>
                  </button>
                )}
                {onlyInMapView && (
                  <button
                    type="button"
                    onClick={() => setOnlyInMapView(false)}
                    className="btn-editorial"
                  >
                    <span>Show All Cebu City Results</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="editorial-restaurant-list">
            {displayedListRestaurants.map((restaurant, index) => (
              <RestaurantListItem
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
                isSelected={selectedRestaurant?.id === restaurant.id}
                onSelect={handleSelectRestaurant}
                onGetDirections={handleGetDirections}
              />
            ))}
          </div>

          {remainingListCount > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderBottom: 'var(--rule-thin)',
                backgroundColor: 'var(--color-paper-alt)',
                textAlign: 'center',
              }}
            >
              <button
                type="button"
                className="btn-editorial btn-block"
                onClick={() => setVisibleListLimit((prev) => prev + LIST_PAGE_SIZE)}
              >
                <ChevronDown size={14} aria-hidden="true" />
                <span>
                  Show {Math.min(LIST_PAGE_SIZE, remainingListCount)} More Establishments (
                  {remainingListCount} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT SECTION: Interactive OpenStreetMap + OSRM Route Navigation */}
      <DiscoveryMap
        restaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        onBoundsChange={updateMapBounds}
        geolocation={geolocation}
        routing={routing}
      />

      {/* MOBILE MODE SWITCHER: Map / Split Sheet / Full Directory List */}
      <nav
        className="mobile-mode-switcher"
        aria-label="Mobile layout view switcher"
      >
        <button
          type="button"
          className={`mobile-mode-btn ${mobileMode === 'map' ? 'active' : ''}`}
          onClick={() => setMobileMode('map')}
        >
          <MapIcon size={14} aria-hidden="true" />
          <span>Full Map</span>
        </button>

        <button
          type="button"
          className={`mobile-mode-btn ${mobileMode === 'split' ? 'active' : ''}`}
          onClick={() => setMobileMode('split')}
        >
          <BookOpen size={14} aria-hidden="true" />
          <span>{selectedRestaurant ? 'Selected Info' : 'Map + Sheet'}</span>
        </button>

        <button
          type="button"
          className={`mobile-mode-btn ${mobileMode === 'list' ? 'active' : ''}`}
          onClick={() => setMobileMode('list')}
        >
          <List size={14} aria-hidden="true" />
          <span>List ({filteredRestaurants.length})</span>
        </button>
      </nav>
    </div>
  );
}
