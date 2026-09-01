import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (typeof window !== 'undefined') (window as any).React = React;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
