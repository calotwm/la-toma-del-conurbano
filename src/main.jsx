import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Sound } from './sound.js';
import './styles.css';

createRoot(document.getElementById('root')).render(<App/>);

// El navegador exige un gesto para arrancar WebAudio: lo desbloqueamos en el primer clic.
document.addEventListener('click', function boot() { Sound.unlock(); }, { once: true });
