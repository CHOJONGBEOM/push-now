import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import App from './App';
import { initAmplitude } from './utils/analytics';

initAmplitude();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
