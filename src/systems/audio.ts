let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  // Resume context if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function playMeleeHit(): void {
  try {
    const c = ctx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch { /* blocked by browser policy */ }
}

export function playMagicHit(): void {
  try {
    const c = ctx();
    const now = c.currentTime;
    [520, 740, 1050].forEach((freq, i) => {
      const t = now + i * 0.06;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.45, t + 0.28);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  } catch { /* blocked */ }
}

export function playLegendaryReveal(): void {
  try {
    const c = ctx();
    const now = c.currentTime;
    // Deep impact hit
    const sub = c.createOscillator();
    const subGain = c.createGain();
    sub.connect(subGain);
    subGain.connect(c.destination);
    sub.type = 'sine';
    sub.frequency.setValueAtTime(55, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    sub.start(now);
    sub.stop(now + 0.8);
    // Rising shimmer chord
    [440, 554, 659, 880, 1108, 1318].forEach((freq, i) => {
      const t = now + 0.1 + i * 0.08;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.8);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.start(t);
      osc.stop(t + 1.2);
    });
    // Final high sparkle
    const sparkle = c.createOscillator();
    const sparkGain = c.createGain();
    sparkle.connect(sparkGain);
    sparkGain.connect(c.destination);
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(2200, now + 0.7);
    sparkle.frequency.exponentialRampToValueAtTime(3500, now + 1.3);
    sparkGain.gain.setValueAtTime(0, now + 0.7);
    sparkGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    sparkle.start(now + 0.7);
    sparkle.stop(now + 1.6);
  } catch { /* blocked */ }
}

export function playHeal(): void {
  try {
    const c = ctx();
    const now = c.currentTime;
    [300, 380, 480, 600].forEach((freq, i) => {
      const t = now + i * 0.045;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch { /* blocked */ }
}
