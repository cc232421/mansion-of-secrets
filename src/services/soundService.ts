/**
 * Sound Service — Procedural audio via Web Audio API
 *
 * All sounds are generated programmatically, no audio files needed.
 * Uses oscillators + filters + gain envelopes for game-appropriate effects.
 */

// ─── Singleton AudioContext ─────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ─── Master volume ────────────────────────────────────────────────────────

let masterVolume = 0.7;

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

export function getMasterVolume(): number {
  return masterVolume;
}

// ─── Sound effect functions ────────────────────────────────────────────────

/**
 * Short click/tick — item pickup
 */
export function playPickup() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(masterVolume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) { /* silently fail if audio not available */ }
}

/**
 * Soft thud — item dropped in empty cell
 */
export function playDrop() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(masterVolume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (_) {}
}

/**
 * Merge chime — success! Pitch increases with level (1=L2, 2=L3, 3=L4)
 */
export function playMerge(level: number) {
  try {
    const ctx = getAudioContext();

    // Base frequency scales with level (higher level = higher pitch)
    const baseFreq = 523.25 * Math.pow(1.122, level); // C5 → ~587 → ~659 Hz

    // Play ascending arpeggio: root → third → fifth → octave
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
    const noteSpacing = 0.07;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * noteSpacing);

      const startTime = ctx.currentTime + i * noteSpacing;
      gain.gain.setValueAtTime(masterVolume * 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (_) {}
}

/**
 * Legendary merge — L4 special sound with shimmer + chord
 */
export function playLegendaryMerge() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // ── Shimmer layer: rapid high-frequency tremolo ──
    for (let i = 0; i < 6; i++) {
      const freq = 2000 + i * 400;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(20, now);
      lfoGain.gain.setValueAtTime(0.15, now);

      gain.gain.setValueAtTime(masterVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.8);
      osc.stop(now + 0.8);
    }

    // ── Chord layer: major triad + octave ──
    const chordFreqs = [523.25, 659.25, 783.99, 1046.5]; // C major chord
    chordFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.03);

      const startTime = now + 0.05 + i * 0.03;
      gain.gain.setValueAtTime(masterVolume * 0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);

      osc.start(startTime);
      osc.stop(startTime + 1.0);
    });
  } catch (_) {}
}

/**
 * Coin reward — cheerful jingle
 */
export function playCoin() {
  try {
    const ctx = getAudioContext();
    const notes = [1318.5, 1568, 2093]; // E6, G6, C7 — bright major triad

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(masterVolume * 0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  } catch (_) {}
}

/**
 * Order complete — triumphant fanfare
 */
export function playOrderComplete() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Short fanfare: ascending scale
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5];
    scale.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      const startTime = now + i * 0.06;
      gain.gain.setValueAtTime(masterVolume * 0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (_) {}
}

/**
 * Failure / error — low buzz
 */
export function playError() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

/**
 * Evidence found — mysterious shimmer
 */
export function playEvidence() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pentatonic scale going up — mysterious feel
    const notes = [440, 554.37, 659.25, 880, 1108.73];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now + i * 0.12);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      const startTime = now + i * 0.12;
      gain.gain.setValueAtTime(masterVolume * 0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (_) {}
}

/**
 * Room unlocked — triumphant fanfare with reverb-like tail
 */
export function playRoomUnlock() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // C major chord + octave sparkle
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = i < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(masterVolume * 0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  } catch (_) {}
}

/**
 * Button click — soft UI feedback
 */
export function playClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);

    gain.gain.setValueAtTime(masterVolume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (_) {}
}

/**
 * Energy low warning — subtle pulse
 */
export function playEnergyLow() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(masterVolume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

/**
 * Auto-spawn new item — gentle chime
 */
export function playSpawn() {
  try {
    const ctx = getAudioContext();
    const freq = 880 + Math.random() * 440; // Random high note

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(masterVolume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

// ─── Sound registry for external control ──────────────────────────────────

export const Sound = {
  pickup: playPickup,
  drop: playDrop,
  merge: playMerge,
  legendaryMerge: playLegendaryMerge,
  coin: playCoin,
  orderComplete: playOrderComplete,
  error: playError,
  evidence: playEvidence,
  roomUnlock: playRoomUnlock,
  click: playClick,
  energyLow: playEnergyLow,
  spawn: playSpawn,
  setMasterVolume,
  getMasterVolume,
};
