import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
// Registrar service worker PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("SW registrado"))
      .catch(err => console.log("Error registrando SW:", err));
  });
}
