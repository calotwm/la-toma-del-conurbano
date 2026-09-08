// ============================================================
// SOUND — motor WebAudio 100% sintetizado (sin archivos)
// ============================================================

export const Sound = (() => {
  let ctx = null, on = true, musicOn = false, musicTimer = null, step = 0;

  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function blip(freq, dur, type, vol, when = 0, slide = 0) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol || 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, filter) {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = s;
    if (filter) {
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filter; f.Q.value = 1.2;
      node.connect(f); f.connect(g);
    } else {
      node.connect(g);
    }
    g.connect(c.destination); s.start(t);
  }

  return {
    toggle() { on = !on; return on; },
    isOn() { return on; },
    unlock() { ac(); },
    click() { if (!on) return; blip(900, 0.06, 'triangle', 0.08); },
    dice() { if (!on) return; for (let i = 0; i < 6; i++) noise(0.05, 0.08, 1800 + i * 200); blip(300, 0.1, 'square', 0.05); },
    diceTick() { if (!on) return; noise(0.045, 0.055, 2000 + Math.random() * 900); }, // traqueteo, uno por frame mientras ruedan los dados
    attack() { if (!on) return; noise(0.35, 0.14, 700); blip(220, 0.3, 'sawtooth', 0.09, 0, -90); },
    alarm() { if (!on) return; for (let i = 0; i < 3; i++) { blip(660, 0.16, 'square', 0.09, i * 0.22); blip(880, 0.16, 'square', 0.09, i * 0.22 + 0.11); } },
    win() { if (!on) return; [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.14, 'square', 0.09, i * 0.09)); },
    lose() { if (!on) return; blip(340, 0.4, 'sawtooth', 0.11, 0, -200); blip(220, 0.5, 'sawtooth', 0.1, 0.22, -140); },
    conquest() { if (!on) return; [392, 523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, 0.18, 'triangle', 0.1, i * 0.07)); noise(0.4, 0.1, 1200); },
    epic() {
      if (!on) return;
      const seq = [523, 523, 523, 659, 784, 784, 659, 784, 1047, 784, 659, 523];
      seq.forEach((f, i) => blip(f, 0.22, 'triangle', 0.12, i * 0.13, 0));
      for (let i = 0; i < 6; i++) blip(2093, 0.5, 'sine', 0.07, i * 0.3);
      noise(0.8, 0.05, 2400);
    },
    defendCapital() { if (!on) return; blip(392, 0.2, 'triangle', 0.14); blip(494, 0.2, 'triangle', 0.14, 0.18); blip(587, 0.35, 'triangle', 0.16, 0.36); },
    mission() { if (!on) return; [659, 659, 0, 659, 0, 523, 659, 784, 0, 392].forEach((f, i) => { if (f) blip(f, 0.2, 'square', 0.09, i * 0.18); }); },
    toggleMusic() {
      musicOn = !musicOn;
      if (!musicOn) { if (musicTimer) clearInterval(musicTimer); musicTimer = null; return false; }
      ac(); step = 0;
      musicTimer = setInterval(() => {
        if (!on || !musicOn) return; if (!ctx) return;
        const beat = step % 16;
        const bass = [55, 55, 65, 55, 49, 49, 65, 65, 55, 55, 65, 55, 58, 58, 62, 62];
        if (beat % 4 === 0) blip(bass[beat], 0.32, 'triangle', 0.16);   // bajada cumbiera
        if (beat % 2 === 0) noise(0.04, 0.05, 5000);                     // chas-chas
        if (beat % 4 === 2) blip(220, 0.1, 'square', 0.03);              // quinto
        if (beat % 16 === 0 || beat % 16 === 10) blip(440, 0.3, 'sine', 0.06); // melodía
        step++;
      }, 150);
      return true;
    },
  };
})();
