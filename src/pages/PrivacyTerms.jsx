import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Server,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export default function PrivacyTerms() {
  return (
    <div className="editorial-page-container" style={{ maxWidth: '1020px' }}>
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

        <Link to="/owner" className="btn-editorial btn-editorial-ink btn-sm">
          <ShieldCheck size={13} aria-hidden="true" />
          <span>Owner Portal</span>
        </Link>
      </div>

      <article className="menu-broadsheet">
        <div className="menu-broadsheet-inner-frame">
          <header className="menu-broadsheet-header">
            <div>
              <span className="editorial-kicker">
                Information Security &amp; Governance Standard
              </span>
              <h1 className="menu-broadsheet-title" style={{ fontSize: '2rem' }}>
                Privacy Policy, Terms &amp; Conditions (CIA Triad)
              </h1>
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '0.9rem',
                  color: 'var(--color-secondary)',
                  maxWidth: '680px',
                }}
              >
                FoodFinder protects diners and restaurant owners in Cebu City by organizing
                its data privacy rules, user terms, and technical safeguards around the
                <strong> CIA Triad</strong>: <strong>Confidentiality</strong>,{' '}
                <strong>Integrity</strong>, and <strong>Availability</strong>.
              </p>
            </div>
          </header>

          {/* CIA TRIAD PILLARS GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              marginBottom: '26px',
            }}
          >
            {/* 1. CONFIDENTIALITY */}
            <section className="editorial-card" aria-label="Confidentiality Policy">
              <div className="editorial-card-header">
                <div>
                  <span className="editorial-kicker">Pillar 01 · Privacy</span>
                  <h2
                    className="serif-heading"
                    style={{ fontSize: '1.25rem', marginTop: '3px' }}
                  >
                    Confidentiality
                  </h2>
                </div>
                <Lock size={20} color="var(--color-primary-mid)" aria-hidden="true" />
              </div>

              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--color-secondary)',
                  marginBottom: '12px',
                }}
              >
                Ensuring sensitive user location data, owner credentials, and business
                verification records are accessible only to authorized parties.
              </p>

              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.82rem',
                }}
              >
                <li>
                  <strong>Real-Time GPS Privacy:</strong> Your browser geolocation is used
                  strictly in memory to center the map and request OSRM driving directions.
                  FoodFinder never stores, logs, or sells your GPS coordinates.
                </li>
                <li>
                  <strong>Private Ownership Evidence:</strong> Proof of business ownership
                  submitted in <code>restaurant_claims</code> is protected by Supabase Row
                  Level Security (RLS). Only the submitting owner and designated claim
                  reviewers can view evidence.
                </li>
                <li>
                  <strong>Private Menu Drafts:</strong> Unpublished dishes in{' '}
                  <code>restaurant_menu_drafts</code> remain private to the verified owner
                  account until explicitly published.
                </li>
                <li>
                  <strong>Zero Secret Exposure:</strong> Authentication passwords are
                  managed by Supabase Auth, and no service-role keys are ever exposed in
                  the browser client.
                </li>
              </ul>
            </section>

            {/* 2. INTEGRITY */}
            <section className="editorial-card" aria-label="Integrity Policy">
              <div className="editorial-card-header">
                <div>
                  <span className="editorial-kicker">Pillar 02 · Accuracy</span>
                  <h2
                    className="serif-heading"
                    style={{ fontSize: '1.25rem', marginTop: '3px' }}
                  >
                    Integrity
                  </h2>
                </div>
                <ShieldCheck
                  size={20}
                  color="var(--color-accent-deep)"
                  aria-hidden="true"
                />
              </div>

              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--color-secondary)',
                  marginBottom: '12px',
                }}
              >
                Guaranteeing that restaurant locations, road routes, and food menu prices
                in Philippine Pesos (₱) are authentic, accurate, and protected from
                unauthorized modification.
              </p>

              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.82rem',
                }}
              >
                <li>
                  <strong>No Fake Data Guarantee:</strong> FoodFinder never invents
                  restaurants, menus, or prices. If a restaurant does not have a verified
                  owner menu, the system explicitly states{' '}
                  <em>&ldquo;Menu currently unavailable.&rdquo;</em>
                </li>
                <li>
                  <strong>Anti-Self-Approval (Separation of Duties):</strong> Enforced by
                  PostgreSQL RLS (<code>owner_id &lt;&gt; auth.uid()</code>), owners can
                  never approve their own restaurant claims or edit another owner&rsquo;s
                  menu.
                </li>
                <li>
                  <strong>Cebu City Boundary &amp; Price Validation:</strong> Database
                  constraints (<code>is_cebu_city_location</code>) verify that all
                  published coordinates fall inside Cebu City and that all menu prices are
                  valid non-negative PHP values.
                </li>
                <li>
                  <strong>Automatic Revocation Trigger:</strong> If an approved claim is
                  revoked, the database trigger{' '}
                  <code>remove_menu_after_claim_revocation</code> automatically removes the
                  published menu.
                </li>
              </ul>
            </section>

            {/* 3. AVAILABILITY */}
            <section className="editorial-card" aria-label="Availability Policy">
              <div className="editorial-card-header">
                <div>
                  <span className="editorial-kicker">Pillar 03 · Reliability</span>
                  <h2
                    className="serif-heading"
                    style={{ fontSize: '1.25rem', marginTop: '3px' }}
                  >
                    Availability
                  </h2>
                </div>
                <Server size={20} color="var(--color-primary-mid)" aria-hidden="true" />
              </div>

              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--color-secondary)',
                  marginBottom: '12px',
                }}
              >
                Maintaining dependable access to restaurant discovery, interactive maps,
                published menus, and route navigation across desktop and mobile devices.
              </p>

              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.82rem',
                }}
              >
                <li>
                  <strong>Overpass Multi-Mirror Failover &amp; Caching:</strong> Restaurant
                  queries use a 10-minute cache, in-flight request deduplication, and
                  automatic failover to backup Overpass mirrors if the primary endpoint is
                  busy.
                </li>
                <li>
                  <strong>Anti-Lag Map Pin Limitation:</strong> To prevent browser lag in
                  dense areas of Cebu City, map markers are filtered to the visible
                  viewport and capped (default 60 pins, adjustable from 30 to 150).
                </li>
                <li>
                  <strong>Manual Route Fallback:</strong> If GPS access is denied or
                  unavailable, users can still calculate OSRM road routes by tapping any
                  starting point on the map or selecting a Cebu City landmark preset.
                </li>
                <li>
                  <strong>Throttled Live Tracking:</strong> Live GPS route recalculation is
                  throttled (minimum 12s and 35m movement) and cleaned up automatically
                  when navigation ends.
                </li>
              </ul>
            </section>
          </div>

          {/* USER & OWNER TERMS OF USE */}
          <section className="editorial-card" aria-label="Terms and Conditions of Use">
            <div className="editorial-card-header">
              <div>
                <span className="editorial-kicker">Platform Agreement</span>
                <h2
                  className="serif-heading"
                  style={{ fontSize: '1.25rem', marginTop: '3px' }}
                >
                  Terms &amp; Conditions for Diners and Restaurant Owners
                </h2>
              </div>
              <ShieldAlert size={20} color="var(--color-primary-mid)" aria-hidden="true" />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                fontSize: '0.83rem',
                color: 'var(--color-secondary)',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    color: 'var(--color-primary)',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={15} color="var(--color-accent-deep)" />
                  <span>1. Restaurant Owner Obligations</span>
                </h3>
                <p>
                  By registering an owner account or submitting a claim, you confirm that
                  you are an authorized representative of the Cebu City establishment and
                  that all uploaded menu items, Philippine Peso (₱) prices, and dish
                  photographs are truthful and current.
                </p>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    color: 'var(--color-primary)',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={15} color="var(--color-accent-deep)" />
                  <span>2. OpenStreetMap &amp; OSRM Usage</span>
                </h3>
                <p>
                  Map tiles and geospatial data are © OpenStreetMap contributors under the
                  ODbL license. OSRM road routes are provided as driving estimates; drivers
                  must always follow actual Cebu City traffic signs and road conditions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
