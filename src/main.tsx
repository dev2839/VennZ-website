import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LightboxProvider } from './context/LightboxContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LightboxProvider>
        <App />
      </LightboxProvider>
    </AuthProvider>
  </StrictMode>,
);
