import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  List,
  Map as MapIcon,
  Navigation,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
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
const BUDGET_PRESETS = [
  { label: 'Any', value: '' },
  { label: '≤ ₱100', value: '100' },
  { label: '≤ ₱150', value: '150' },
  { label: '≤ ₱250', value: '250' },
  { label: '≤ ₱400', value: '400' },
];
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
    maxBudget,
    setMaxBudget,
    parsedMaxBudget,
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
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);
  const [visibleListLimit, setVisibleListLimit] = useState(LIST_PAGE_SIZE);
  const scrollPaneRef = useRef(null);

  useEffect(() => {
    setVisibleListLimit(LIST_PAGE_SIZE);
  }, [
    searchQuery,
    selectedCategory,
    selectedCuisine,
    maxBudget,
    onlyVerifiedMenus,
    onlyInMapView,
  ]);

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
    if (scrollPaneRef.current) {
      scrollPaneRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGetDirections = (restaurant) => {
    setSelectedRestaurant(restaurant);
    routing.startNavigationTo(restaurant);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobileMode('map');
    }
  };

  const cycleMobileSheetSize = () => {
    setMobileMode((prev) => {
      if (prev === 'split') return 'list';
      if (prev === 'list') return 'map';
      return 'split';
    });
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'All' ||
    selectedCuisine !== 'All' ||
    parsedMaxBudget !== null ||
    onlyVerifiedMenus;

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedCuisine !== 'All' ? 1 : 0) +
    (parsedMaxBudget !== null ? 1 : 0) +
    (onlyVerifiedMenus ? 1 : 0) +
    (!onlyInMapView ? 1 : 0);

  const hasActiveRoute = Boolean(
    routing.targetRestaurant || routing.route || routing.loading || routing.isPickingOrigin
  );

  const MastheadIllustration =
    selectedCategory === 'Café'
      ? CoffeeCupIllustration
      : selectedCategory === 'Fast Food'
        ? FoodBowlIllustration
        : PlateUtensilsIllustration;

  return (
    <div className="discover-split-layout">
      {/* LEFT SECTION / MOBILE FLEXIBLE BOTTOM SHEET */}
      <section
        className={`discover-left-column mobile-mode-${mobileMode}`}
        aria-label="Restaurant Discovery Directory"
      >
        {/* Mobile Tactile Sheet Grab Handle Bar */}
        <div className="mobile-sheet-grab-bar">
          <button
            type="button"
            className="mobile-sheet-grab-btn"
            onClick={cycleMobileSheetSize}
            aria-label="Toggle bottom sheet height"
          >
            <span className="mobile-sheet-pill" aria-hidden="true" />
            <span className="mobile-sheet-grab-title">
              {selectedRestaurant
                ? selectedRestaurant.name
                : `${filteredRestaurants.length} Cebu City Establishments`}
            </span>
          </button>

          <button
            type="button"
            className={`btn-editorial btn-sm mobile-filter-toggle-btn ${
              mobileFiltersExpanded || activeFilterCount > 0 ? 'btn-editorial-ink' : ''
            }`}
            onClick={() => setMobileFiltersExpanded((prev) => !prev)}
            aria-expanded={mobileFiltersExpanded}
          >
            <SlidersHorizontal size={12} aria-hidden="true" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            {mobileFiltersExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Desktop Masthead */}
        <div className="discover-editorial-masthead">
          <div>
            <span className="editorial-kicker">Cebu City Field Guide</span>
            <h1 className="discover-masthead-title">
              Local Tables, Menus &amp; Road Routes
            </h1>
            <p className="discover-masthead-sub">
              Live OpenStreetMap establishments, verified menus in ₱, max budget filter, and OSRM street directions.
            </p>
          </div>
          <div className="discover-masthead-art">
            <MastheadIllustration size={48} />
          </div>
        </div>

        {/* Search, Category & Max Budget (₱) Controls */}
        <div
          className={`discover-controls-section ${
            mobileFiltersExpanded ? 'mobile-filters-open' : ''
          }`}
        >
          <div className="search-box-editorial">
            <Search size={16} className="search-box-icon" aria-hidden="true" />
            <input
              type="text"
              className="editorial-input"
              aria-label="Search restaurants, dishes, cuisines, or streets in Cebu City"
              placeholder="Search Jollibee, Lechon, Siomai, Café, or dish…"
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

          {/* MAX BUDGET (₱) FILTER ROW */}
          <div
            className="budget-filter-row"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              padding: '9px 11px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-background)',
              boxShadow: 'var(--neu-inset-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <label
                htmlFor="max-budget-input"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-primary)',
                }}
              >
                <Wallet size={13} color="var(--color-accent-deep)" aria-hidden="true" />
                <span>Max Dish Budget (₱):</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  id="max-budget-input"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Any ₱"
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(event.target.value)}
                  style={{
                    width: '96px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1px solid rgba(45, 22, 84, 0.2)',
                    backgroundColor: 'var(--color-surface-pure)',
                    color: 'var(--color-primary)',
                  }}
                />
                {maxBudget && (
                  <button
                    type="button"
                    className="btn-editorial btn-sm"
                    onClick={() => setMaxBudget('')}
                    style={{ padding: '4px 8px' }}
                    aria-label="Clear max budget filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div
              style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
              role="group"
              aria-label="Quick Max Budget Presets"
            >
              {BUDGET_PRESETS.map((preset) => {
                const isActive = String(maxBudget) === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMaxBudget(preset.value)}
                    className={`filter-toggle-chip ${isActive ? 'active' : ''}`}
                    style={{ padding: '4px 9px', fontSize: '0.7rem', flex: 1 }}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
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
              'Syncing Cebu City establishments…'
            ) : (
              <>
                Matching{' '}
                <span className="status-count-strong">
                  {filteredRestaurants.length}
                </span>{' '}
                of {allRestaurants.length} places
                {parsedMaxBudget !== null && ` (≤ ₱${parsedMaxBudget})`}
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

        {/* Scrollable Pane: Selected Restaurant Folio + Restaurant Directory List */}
        <div ref={scrollPaneRef} className="discover-scroll-pane">
          {selectedRestaurant && (
            <SelectedRestaurantPanel
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
              onGetDirections={handleGetDirections}
              routingLoading={routing.loading}
            />
          )}

          {error && (
            <div className="editorial-empty-state" role="alert">
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
            <div className="editorial-empty-state">
              <StorefrontIllustration size={72} />
              <h2 className="editorial-empty-title">No Establishments Match Filter</h2>
              <p className="editorial-empty-copy">
                {parsedMaxBudget !== null
                  ? `No restaurants with verified menu items at or under ₱${parsedMaxBudget} were found in this view. Try increasing your max budget or resetting filters.`
                  : 'No restaurants, cafés, or fast-food spots matched your current map boundaries and filters.'}
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
                maxBudget={parsedMaxBudget}
                onSelect={handleSelectRestaurant}
                onGetDirections={handleGetDirections}
              />
            ))}
          </div>

          {remainingListCount > 0 && (
            <div style={{ padding: '8px 0 16px', textAlign: 'center' }}>
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
        mobileMode={mobileMode}
      />

      {/* MOBILE MODE SWITCHER: Map / Split Sheet / Full List / Active Route */}
      <nav
        className={`mobile-mode-switcher ${hasActiveRoute ? 'has-route' : ''}`}
        aria-label="Mobile layout view switcher"
      >
        <button
          type="button"
          className={`mobile-mode-btn ${
            mobileMode === 'map' && !hasActiveRoute ? 'active' : ''
          }`}
          onClick={() => setMobileMode('map')}
        >
          <MapIcon size={14} aria-hidden="true" />
          <span>Map</span>
        </button>

        <button
          type="button"
          className={`mobile-mode-btn ${mobileMode === 'split' ? 'active' : ''}`}
          onClick={() => setMobileMode('split')}
        >
          <BookOpen size={14} aria-hidden="true" />
          <span>{selectedRestaurant ? 'Selected' : 'Split'}</span>
        </button>

        <button
          type="button"
          className={`mobile-mode-btn ${mobileMode === 'list' ? 'active' : ''}`}
          onClick={() => setMobileMode('list')}
        >
          <List size={14} aria-hidden="true" />
          <span>List ({filteredRestaurants.length})</span>
        </button>

        {hasActiveRoute && (
          <button
            type="button"
            className={`mobile-mode-btn ${mobileMode === 'map' ? 'active' : ''}`}
            onClick={() => setMobileMode('map')}
          >
            <Navigation size={14} aria-hidden="true" />
            <span>Route</span>
          </button>
        )}
      </nav>
    </div>
  );
}
