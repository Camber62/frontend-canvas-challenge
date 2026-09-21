import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AppProviders } from './app/providers';
import '@xyflow/react/dist/style.css';
import './app/styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден корневой элемент');

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
