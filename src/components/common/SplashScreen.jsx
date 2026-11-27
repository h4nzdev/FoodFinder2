import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '../../styles/splash.css';

const SESSION_KEY = 'foodfinder-splash-shown';
const BRAND = 'FOODFINDER';

function shouldShowSplash() {
  if (typeof window === 'undefined') return false;
  try {
    return !window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return true;
  }
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(shouldShowSplash);
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!visible || !rootRef.current) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore storage errors */
      }
      setVisible(false);
    };

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.timeline({ onComplete: finish })
          .from('.splash-content', { opacity: 0, duration: 0.4 })
          .to(rootRef.current, { opacity: 0, duration: 0.4, delay: 0.8 });
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });

      // Logo emblem: squash-and-stretch rubbery drop
      tl.from('.splash-emblem', {
        y: -160,
        scaleY: 1.4,
        scaleX: 0.7,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.in',
      })
        .to('.splash-emblem', { scaleY: 0.6, scaleX: 1.35, duration: 0.12, ease: 'power1.out' })
        .to('.splash-emblem', { scaleY: 1, scaleX: 1, duration: 0.9, ease: 'elastic.out(1.2, 0.3)' })

        // Brand letters: rubbery elastic pop-in with stagger
        .from(
          '.splash-letter',
          {
            y: 80,
            scaleY: 0.2,
            scaleX: 1.6,
            opacity: 0,
            duration: 1.1,
            ease: 'elastic.out(1.1, 0.35)',
            stagger: 0.06,
          },
          '-=0.75'
        )

        // Gold underline stretches out
        .from(
          '.splash-underline',
          { scaleX: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' },
          '-=0.7'
        )
        .from('.splash-tagline', { y: 16, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.5')

        // Jelly wobble across the word
        .to('.splash-letter', {
          keyframes: [
            { scaleY: 1.25, scaleX: 0.85, duration: 0.12 },
            { scaleY: 0.9, scaleX: 1.1, duration: 0.12 },
            { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)' },
          ],
          stagger: 0.04,
        }, '+=0.15')

        // Exit: content shrinks, purple panel slides up with a soft overshoot
        .to('.splash-content', { scale: 0.85, opacity: 0, duration: 0.4, ease: 'back.in(2)' }, '+=0.25')
        .to(rootRef.current, { yPercent: -100, duration: 0.75, ease: 'power4.inOut' }, '-=0.1');
    }, rootRef);

    return () => ctx.revert();
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="splash-root" role="status" aria-label="Loading FoodFinder">
      <div className="splash-content">
        <div className="splash-emblem" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="22" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="32" cy="32" r="13" stroke="#F59E0B" strokeWidth="3" />
            <path d="M14 14v14M10 14v8a4 4 0 0 0 8 0v-8M14 28v22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 14c-4 2-5 8-5 14h5v22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="splash-title" aria-hidden="true">
          {BRAND.split('').map((char, index) => (
            <span key={index} className="splash-letter">
              {char}
            </span>
          ))}
        </h1>
        <div className="splash-underline" aria-hidden="true" />
        <p className="splash-tagline">Kaon ta, Sugbo! · Cebu City Food Map</p>
      </div>
    </div>
  );
}
