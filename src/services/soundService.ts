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
 * Legendary merge — L4 special sound: Celestial Chime
 *
 * Three-layer design for a magical, joyful, triumphant feel:
 *   Layer 1: Ascending arpeggio (C5→E5→G5→C6→E6) with bell overtones
 *   Layer 2: Warm bass harmony (C4 + G4) for body and power
 *   Layer 3: High-frequency sparkle (3 closely-spaced sines) for joy
 *
 * Bell harmonics [1.0, 2.756, 5.404, 8.933] create a bell/glass tone.
 * Ascending arpeggio conveys escalating achievement and excitement.
 * Pure sine waves throughout = clean, pleasant, not harsh.
 */
export function playLegendaryMerge() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // ── Layer 1: Ascending arpeggio with bell overtones ─────────────
    // C major arpeggio climbing: C5 → E5 → G5 → C6 → E6
    // Bell harmonic ratios give a glass/crystal bell quality
    const BELL_RATIOS = [1.0, 2.756, 5.404, 8.933];
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    const NOTE_INTERVAL = 0.065; // 65ms between notes — fast = exciting

    arpeggio.forEach((freq, noteIdx) => {
      const noteStart = now + noteIdx * NOTE_INTERVAL;

      BELL_RATIOS.forEach((ratio, harmIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * ratio, noteStart);

        // Harmonics decay faster than fundamental (realistic bell behavior)
        const harmDecay = 0.3 + harmIdx * 0.05;
        const harmAmp = masterVolume * 0.15 / (harmIdx * 1.5 + 1);
        gain.gain.setValueAtTime(harmAmp, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + harmDecay);

        osc.start(noteStart);
        osc.stop(noteStart + harmDecay + 0.05);
      });
    });

    // ── Layer 2: Warm bass harmony for body ─────────────────────────
    // C4 (261.63Hz) + G4 (392Hz) — open fifth, rich and warm
    const bassFreqs = [261.63, 392.0];
    bassFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight volume swell then long decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.start(now);
      osc.stop(now + 1.5);
    });

    // ── Layer 3: High-frequency sparkle — joy and magic ─────────────
    // Three closely-spaced sines (not harmonically related) for shimmer
    // Spread around 2400-3800Hz — audible sparkle without harshness
    const sparkleFreqs = [2354, 2937, 3689];
    sparkleFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      const sparkleStart = now + i * 0.04;
      gain.gain.setValueAtTime(masterVolume * 0.08, sparkleStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, sparkleStart + 1.0);

      osc.start(sparkleStart);
      osc.stop(sparkleStart + 1.05);
    });

    // ── Final resolution chord: C major with octave ──────────────────
    // Enters at ~350ms, gives the "triumphant resolution" feel
    const chordFreqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6 E6 G6 C7
    chordFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const chordStart = now + 0.35 + i * 0.025;
      osc.frequency.setValueAtTime(freq, chordStart);

      gain.gain.setValueAtTime(masterVolume * 0.14, chordStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + 1.5);

      osc.start(chordStart);
      osc.stop(chordStart + 1.6);
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
