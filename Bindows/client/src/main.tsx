import React from 'react';
// wpm: expose React for ESM packages from VM-APPSTORE
// @ts-ignore
if (typeof window !== 'undefined') (window as any).React = React;
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
