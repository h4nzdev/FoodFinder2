import { useEffect, useRef, useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X, Zap } from 'lucide-react';
import '../../styles/installPrompt.css';

const DISMISS_KEY = 'foodfinder-install-dismissed-at';
const DISMISS_DAYS = 3;
const SHOW_DELAY_MS = 6000; // wait until the splash screen has finished

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const deferredPrompt = useRef(null);
  const installBtnRef = useRef(null);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return undefined;
    let timer;

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      deferredPrompt.current = event;
      timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    };
    const handleInstalled = () => {
      deferredPrompt.current = null;
      setOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    // iOS Safari has no beforeinstallprompt: show manual "Add to Home Screen" guide
    if (isIos()) {
      setIosMode(true);
      timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    installBtnRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const install = async () => {
    const promptEvent = deferredPrompt.current;
    if (!promptEvent) return dismiss();
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    deferredPrompt.current = null;
    if (outcome === 'accepted') setOpen(false);
    else dismiss();
  };

  if (!open) return null;

  return (
    <div className="install-backdrop" onClick={dismiss}>
      <section
        className="install-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="install-close" aria-label="Close" onClick={dismiss}>
          <X size={18} aria-hidden="true" />
        </button>

        <img src="/pwa-192.png" alt="" className="install-icon" width="72" height="72" />
        <h2 id="install-title" className="install-title">Install FoodFinder</h2>
        <p className="install-copy">
          Add FoodFinder to your home screen for a faster, full-screen Cebu City food map.
        </p>

        <ul className="install-perks">
          <li><Zap size={15} aria-hidden="true" /><span>Opens instantly like a native app</span></li>
          <li><Smartphone size={15} aria-hidden="true" /><span>Full-screen map, no browser bars</span></li>
          <li><WifiOff size={15} aria-hidden="true" /><span>App shell loads even on weak signal</span></li>
        </ul>

        {iosMode ? (
          <div className="install-ios">
            Tap <Share size={14} aria-label="Share" /> <strong>Share</strong>, then{' '}
            <strong>Add to Home Screen</strong>.
          </div>
        ) : null}

        <div className="install-actions">
          <button type="button" className="btn-editorial btn-editorial-ghost" onClick={dismiss}>
            <span>Maybe Later</span>
          </button>
          {!iosMode && (
            <button
              ref={installBtnRef}
              type="button"
              className="btn-editorial btn-editorial-ink"
              onClick={install}
            >
              <Download size={15} aria-hidden="true" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
