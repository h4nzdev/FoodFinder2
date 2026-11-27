import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SplashScreen from './components/common/SplashScreen';
import './styles/tokens.css';
import './styles/global.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SplashScreen />
      <App />
    </BrowserRouter>
  </StrictMode>
);
