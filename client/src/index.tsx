import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind base styles
import App from './App';

//Find the <div id="root"> in index.html and mount the React app inside it
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

//strictMode highlights potential problems in development (no effect in production)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);