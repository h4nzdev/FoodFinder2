import { Link, useLocation } from 'react-router-dom';
import { Compass, ShieldCheck, Store, LogOut } from 'lucide-react';

export default function Header({ session, isReviewer, onSignOut }) {
  const { pathname } = useLocation();

  const isDiscover =
    pathname === '/' ||
    pathname.startsWith('/discover') ||
    pathname.startsWith('/explore');
  const isOwner = pathname.startsWith('/owner');
  const isReview = pathname.startsWith('/claims/review');

  return (
    <header className="editorial-header">
      <div className="editorial-header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="brand-masthead" aria-label="FoodFinder Cebu City Home">
            <span className="brand-emblem" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="10" stroke="#FFFFFF" strokeWidth="1.9" />
                <circle
                  cx="16"
                  cy="16"
                  r="6"
                  stroke="#F59E0B"
                  strokeWidth="1.4"
                  strokeDasharray="2 2"
                />
                <path
                  d="M3 8v6c0 1.2 1 2 2 2v8M3 11h2M5 8v6"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M29 8c-1.5 0-2.5 1.8-2.5 4.5V16H29v8"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="brand-titles">
              <span className="brand-wordmark">FOODFINDER</span>
              <span className="brand-subline">
                Cebu City Culinary Index &amp; Route Atlas
              </span>
            </span>
          </Link>

          <div className="header-edition-badge" aria-label="Edition location">
            <span className="header-edition-dot" aria-hidden="true" />
            <span>Cebu City, PH</span>
            <span>·</span>
            <span>OSM + OSRM</span>
          </div>
        </div>

        <nav className="editorial-nav" aria-label="Primary Navigation">
          <Link
            to="/"
            className={`editorial-nav-link ${isDiscover ? 'active' : ''}`}
          >
            <Compass size={15} aria-hidden="true" />
            <span>Discover &amp; Map</span>
          </Link>

          <Link
            to="/owner"
            className={`editorial-nav-link ${isOwner ? 'active' : ''}`}
          >
            <Store size={15} aria-hidden="true" />
            <span>{session ? 'Owner Dashboard' : 'Owner Portal'}</span>
          </Link>

          {isReviewer && (
            <Link
              to="/claims/review"
              className={`editorial-nav-link ${isReview ? 'active' : ''}`}
            >
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Claim Review</span>
            </Link>
          )}

          {session && (
            <button
              type="button"
              onClick={onSignOut}
              className="btn-editorial btn-sm"
              title={`Signed in as ${session.user?.email || 'Owner'}`}
            >
              <LogOut size={13} aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
