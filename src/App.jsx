import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/common/Header';
import Discover from './pages/Discover';
import RestaurantDetails from './pages/RestaurantDetails';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import ClaimReview from './pages/ClaimReview';
import PrivacyTerms from './pages/PrivacyTerms';
import { supabase } from './lib/supabase';
import { checkIsReviewer, signOutOwner } from './services/ownerService';

export default function App() {
  const [session, setSession] = useState(supabase ? undefined : null);
  const [isReviewer, setIsReviewer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data?.session ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsReviewer(false);
      return;
    }

    const controller = new AbortController();
    checkIsReviewer(userId, controller.signal).then((authorized) => {
      if (!controller.signal.aborted) {
        setIsReviewer(authorized);
      }
    });

    return () => controller.abort();
  }, [session?.user?.id]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutOwner();
      navigate('/');
    } catch {
      /* Handled by auth state listener */
    }
  }, [navigate]);

  return (
    <div className="app-shell">
      <Header
        session={session}
        isReviewer={isReviewer}
        onSignOut={handleSignOut}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/explore" element={<Discover />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/owner/login" element={<OwnerLogin session={session} />} />
          <Route path="/login" element={<OwnerLogin session={session} />} />
          <Route path="/register" element={<OwnerLogin session={session} />} />
          <Route
            path="/owner"
            element={<OwnerDashboard session={session} isReviewer={isReviewer} />}
          />
          <Route
            path="/claims/review"
            element={<ClaimReview session={session} />}
          />
          <Route path="/privacy-terms" element={<PrivacyTerms />} />
          <Route path="*" element={<Discover />} />
        </Routes>
      </main>
    </div>
  );
}
