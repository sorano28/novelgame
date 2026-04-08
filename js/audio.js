let audioCtx;

function context() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playSe(type, volume) {
  const ctx = context();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const amp = Math.max(0, Math.min(1, volume / 100)) * 0.08;

  const table = {
    click: { freq: 680, duration: 0.035 },
    decide: { freq: 520, duration: 0.08 },
    menu: { freq: 430, duration: 0.05 },
    memory: { freq: 900, duration: 0.14 },
  };

  const picked = table[type] ?? table.click;
  osc.type = "triangle";
  osc.frequency.value = picked.freq;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(amp, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + picked.duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + picked.duration + 0.02);
}
