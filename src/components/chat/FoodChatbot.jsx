import { useEffect, useRef, useState } from 'react';
import { Bot, MapPin, Navigation, Send, Sparkles, X } from 'lucide-react';
import { askFoodBot } from '../../services/chatbotService';

const LOCATION_TEXT = {
  bisaya: {
    ask: 'Wala pa nako nahibal-an asa ka karon 📍 Pwede ba nimo i-share imong location para makapangita ko og duol nga kan-anan?',
    shareLabel: 'I-share akong location',
    skipLabel: 'Dili lang sa',
    done: 'Salamat! Nakuha na nako imong location 📍 Unsa imong ganahan kan-on o pila imong budget?',
    skipped: 'Sige ra! Mo-suggest lang ko bisan asa sa Cebu City. Unsa imong ganahan kan-on?',
    failed: 'Pasensya, wala nako makuha imong location. Palihug i-allow ang location sa browser o sulayi pag-usab.',
  },
  english: {
    ask: "I don't know your location yet 📍 Can you share it so I can find restaurants near you?",
    shareLabel: 'Share my location',
    skipLabel: 'Not now',
    done: "Thanks! I've got your location 📍 What are you craving, or what's your budget?",
    skipped: "No problem! I'll suggest spots anywhere in Cebu City. What are you craving?",
    failed: "Sorry, I couldn't get your location. Please allow location access in your browser and try again.",
  },
};

const STARTER_PROMPTS = {
  bisaya: ['Barato nga kaon ubos ₱150 duol nako', 'Asa nindot nga lechon?', 'Hilom nga café para mag-study'],
  english: ['Cheap eats under ₱150 near me', 'Best lechon nearby', 'Quiet café to study'],
};

const GREETINGS = {
  bisaya: 'Sige, mag-Bisaya ta! 😄 Unsa imong ganahan kan-on o pila imong budget? Pangitaan tika og duol nga kan-anan.',
  english: "Great, let's chat in English! Tell me your craving or budget and I'll find Cebu City spots near you.",
};

function readOrigin(geolocation) {
  const loc = geolocation?.activeLocation || geolocation?.coords;
  if (!loc) return null;
  const lat = Number(loc.lat ?? loc.latitude);
  const lon = Number(loc.lon ?? loc.lng ?? loc.longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

// GenUI recommendation card rendered from the model's structured JSON response
function RecommendationCard({ rec, language, onView, onDirections }) {
  const { restaurant, reason, highlight, km } = rec;
  const price =
    restaurant.minPrice != null
      ? `₱${restaurant.minPrice}${restaurant.maxPrice ? `–₱${restaurant.maxPrice}` : '+'}`
      : null;

  return (
    <article className="chatbot-rec-card">
      <div className="chatbot-rec-top">
        <strong className="chatbot-rec-name">{restaurant.name}</strong>
        {highlight && <span className="chatbot-rec-tag">{highlight}</span>}
      </div>
      <div className="chatbot-rec-meta">
        <span>{restaurant.category}</span>
        {price && <span>· {price}</span>}
        {Number.isFinite(km) && <span>· {km.toFixed(1)} km</span>}
      </div>
      {reason && <p className="chatbot-rec-reason">{reason}</p>}
      <div className="chatbot-rec-actions">
        <button type="button" className="btn-editorial btn-sm" onClick={() => onView(restaurant)}>
          <MapPin size={12} aria-hidden="true" />
          <span>{language === 'english' ? 'View' : 'Tan-awa'}</span>
        </button>
        <button
          type="button"
          className="btn-editorial btn-editorial-ink btn-sm"
          onClick={() => onDirections(restaurant)}
        >
          <Navigation size={12} aria-hidden="true" />
          <span>{language === 'english' ? 'Directions' : 'Agianan'}</span>
        </button>
      </div>
    </article>
  );
}

export default function FoodChatbot({ restaurants, geolocation, onSelectRestaurant, onGetDirections }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState(null); // null until user picks: 'bisaya' | 'english'
  const [locationAsked, setLocationAsked] = useState(false);
  const [awaitingLocation, setAwaitingLocation] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Maayong adlaw! Ako si SugBot 🍽️ Unsa nga pinulongan imong gusto? / Which language do you prefer?',
      languagePicker: true,
    },
  ]);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const chooseLanguage = (lang) => {
    setLanguage(lang);
    const needsLocation = !readOrigin(geolocation) && !locationAsked;
    if (needsLocation) setLocationAsked(true);
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, languagePicker: false })),
      { role: 'user', content: lang === 'bisaya' ? 'Bisaya' : 'English' },
      needsLocation
        ? { role: 'assistant', content: LOCATION_TEXT[lang].ask, locationPicker: true }
        : {
            role: 'assistant',
            content: GREETINGS[lang],
            suggestions: STARTER_PROMPTS[lang],
          },
    ]);
  };

  const lang = language || 'bisaya';

  const handleShareLocation = () => {
    setAwaitingLocation(true);
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, locationPicker: false })),
      { role: 'user', content: LOCATION_TEXT[lang].shareLabel },
    ]);
    geolocation?.requestLocation?.()?.catch?.(() => {});
  };

  const handleSkipLocation = () => {
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, locationPicker: false })),
      { role: 'user', content: LOCATION_TEXT[lang].skipLabel },
      { role: 'assistant', content: LOCATION_TEXT[lang].skipped, suggestions: STARTER_PROMPTS[lang] },
    ]);
  };

  // When GPS arrives (or fails) after the user agreed to share, confirm in chat
  const originKey = readOrigin(geolocation);
  const hasOrigin = Boolean(originKey);
  const geoError = geolocation?.error;
  useEffect(() => {
    if (!awaitingLocation) return;
    if (hasOrigin) {
      setAwaitingLocation(false);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: LOCATION_TEXT[lang].done, suggestions: STARTER_PROMPTS[lang] },
      ]);
    } else if (geoError) {
      setAwaitingLocation(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: LOCATION_TEXT[lang].failed,
          locationPicker: true,
        },
      ]);
    }
  }, [awaitingLocation, hasOrigin, geoError, lang]);

  const send = async (text) => {
    const content = String(text || '').trim();
    if (!content || busy) return;
    const activeLanguage = language || 'bisaya';
    if (!language) setLanguage('bisaya');

    const nextHistory = [
      ...messages.map((m) => ({ ...m, languagePicker: false, locationPicker: false })),
      { role: 'user', content },
    ];
    setMessages(nextHistory);
    setInput('');
    setBusy(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await askFoodBot({
        history: nextHistory.map(({ role, content: c }) => ({ role, content: c })),
        restaurants,
        origin: readOrigin(geolocation),
        language: activeLanguage,
        signal: controller.signal,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.message,
          recommendations: result.recommendations,
          suggestions: result.suggestions,
        },
      ]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I couldn't reach the AI right now (${
            err.response?.data?.error?.message || err.message || 'network error'
          }).`,
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const handleView = (restaurant) => {
    onSelectRestaurant(restaurant);
    setOpen(false);
  };

  const handleDirections = (restaurant) => {
    onGetDirections(restaurant);
    setOpen(false);
  };

  const lastIndex = messages.length - 1;

  return (
    <div className="chatbot-root">
      {open && (
        <section className="chatbot-panel" role="dialog" aria-label="SugBot food assistant">
          <header className="chatbot-header">
            <div className="chatbot-header-title">
              <Sparkles size={15} aria-hidden="true" />
              <span>SugBot</span>
            </div>
            {language && (
              <button
                type="button"
                className="chatbot-lang-toggle"
                aria-label={`Switch to ${language === 'bisaya' ? 'English' : 'Bisaya'}`}
                onClick={() => chooseLanguage(language === 'bisaya' ? 'english' : 'bisaya')}
                disabled={busy}
              >
                {language === 'bisaya' ? 'BIS → EN' : 'EN → BIS'}
              </button>
            )}
            <button
              type="button"
              className="chatbot-icon-btn"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="chatbot-messages" ref={listRef} aria-live="polite">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                <div className="chatbot-bubble">{msg.content}</div>
                {msg.locationPicker && (
                  <div className="chatbot-lang-picker" role="group" aria-label="Share location">
                    <button type="button" className="chatbot-lang-btn" onClick={handleShareLocation}>
                      <span className="chatbot-lang-flag" aria-hidden="true">📍</span>
                      <span className="chatbot-lang-text">
                        <strong>{lang === 'english' ? 'Use GPS' : 'Gamita GPS'}</strong>
                        <small>{LOCATION_TEXT[lang].shareLabel}</small>
                      </span>
                    </button>
                    <button type="button" className="chatbot-lang-btn" onClick={handleSkipLocation}>
                      <span className="chatbot-lang-flag" aria-hidden="true">🗺️</span>
                      <span className="chatbot-lang-text">
                        <strong>{LOCATION_TEXT[lang].skipLabel}</strong>
                        <small>{lang === 'english' ? 'Whole Cebu City' : 'Tibuok Cebu City'}</small>
                      </span>
                    </button>
                  </div>
                )}
                {msg.languagePicker && (
                  <div className="chatbot-lang-picker" role="group" aria-label="Choose language">
                    <button type="button" className="chatbot-lang-btn" onClick={() => chooseLanguage('bisaya')}>
                      <span className="chatbot-lang-flag" aria-hidden="true">🌴</span>
                      <span className="chatbot-lang-text">
                        <strong>Bisaya</strong>
                        <small>Cebuano</small>
                      </span>
                    </button>
                    <button type="button" className="chatbot-lang-btn" onClick={() => chooseLanguage('english')}>
                      <span className="chatbot-lang-flag" aria-hidden="true">💬</span>
                      <span className="chatbot-lang-text">
                        <strong>English</strong>
                        <small>Ingles</small>
                      </span>
                    </button>
                  </div>
                )}
                {msg.recommendations?.map((rec) => (
                  <RecommendationCard
                    key={rec.restaurant.id}
                    rec={rec}
                    language={language}
                    onView={handleView}
                    onDirections={handleDirections}
                  />
                ))}
                {index === lastIndex && !busy && msg.suggestions?.length > 0 && (
                  <div className="chatbot-chips">
                    {msg.suggestions.map((s) => (
                      <button key={s} type="button" className="chatbot-chip" onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="chatbot-msg chatbot-msg-assistant">
                <div className="chatbot-bubble chatbot-typing" aria-label="SugBot is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form
            className="chatbot-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              className="editorial-input"
              autoComplete="off"
              maxLength={300}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={language === 'english' ? 'Ask for food suggestions…' : 'Pangutana bahin sa pagkaon…'}
              aria-label="Message SugBot"
            />
            <button
              type="submit"
              className="btn-editorial btn-editorial-ink btn-sm"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <Send size={14} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`chatbot-fab ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close SugBot' : 'Open SugBot food assistant'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Bot size={22} aria-hidden="true" />}
      </button>
    </div>
  );
}
