import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {assertValidEnvironmentConfig} from './lib/env';

// Refuse to start if any critical environment or security invariant is violated
assertValidEnvironmentConfig();

createRoot(document.getElementById('root')!).render(<App />);
