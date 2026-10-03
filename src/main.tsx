import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LightboxProvider } from './context/LightboxContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LightboxProvider>
        <App />
      </LightboxProvider>
    </AuthProvider>
  </StrictMode>,
);
