import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SplashScreen from './components/common/SplashScreen';
import InstallPrompt from './components/common/InstallPrompt';
import './styles/tokens.css';
import './styles/global.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SplashScreen />
      <App />
      <InstallPrompt />
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.warn('FoodFinder service worker registration failed.', error);
  });
}
