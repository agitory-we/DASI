// Web Audio API based Realistic Camera Shutter Synthesizer
export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('dasi_audio_muted') === 'true';
}

export function toggleAudioMute(): boolean {
  if (typeof window === 'undefined') return false;
  const current = isAudioMuted();
  const next = !current;
  localStorage.setItem('dasi_audio_muted', String(next));
  return next;
}

export function playShutterSound(type: 'slr' | 'leaf' | 'compact' | 'ccd' = 'slr') {
  if (typeof window === 'undefined') return;
  if (isAudioMuted()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. Mirror Slap / Mechanical Spring Thump (Low thump)
    if (type === 'slr' || type === 'compact') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'slr' ? 140 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    // 2. High frequency Metallic Click / Curtain Release (White Noise with Bandpass)
    const bufferSize = ctx.sampleRate * 0.12; // 120ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = type === 'leaf' ? 'highpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'slr' ? 2400 : 3800, now + 0.02);
    filter.Q.setValueAtTime(type === 'slr' ? 3.5 : 1.5, now + 0.02);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.setValueAtTime(0.8, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'leaf' ? 0.05 : 0.11));

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now + 0.015);
    whiteNoise.stop(now + 0.12);

    // 3. Second Curtain Click (Double click feel for SLR mechanical cameras)
    if (type === 'slr') {
      const secondClickTime = now + 0.07;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(800, secondClickTime);
      osc2.frequency.exponentialRampToValueAtTime(100, secondClickTime + 0.04);

      gain2.gain.setValueAtTime(0.4, secondClickTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, secondClickTime + 0.04);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(secondClickTime);
      osc2.stop(secondClickTime + 0.04);
    }

    // Trigger subtle visual flash effect
    triggerCameraFlash();
  } catch (err) {
    console.error('Audio synthesis failed', err);
  }
}

/**
 * Creates a momentary analog strobe flash overlay for tactile sensory feedback
 */
export function triggerCameraFlash() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const flash = document.createElement('div');
  flash.className = 'fixed inset-0 pointer-events-none z-[9999] bg-white transition-opacity duration-150';
  flash.style.opacity = '0.45';
  document.body.appendChild(flash);

  requestAnimationFrame(() => {
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        if (flash.parentNode) {
          flash.parentNode.removeChild(flash);
        }
      }, 150);
    }, 40);
  });
}

/**
 * 짤랑- 맑은 동전 투입 사운드 (Coin drop bell tone)
 */
export function playCoinSound() {
  if (typeof window === 'undefined' || isAudioMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    // Two high metallic chime frequencies
    [1950, 2450].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.35, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.36);
    });
  } catch (err) {
    console.error('Coin sound failed', err);
  }
}

/**
 * 덜커덩- 묵직한 기계식 레버/자판기 캡슐 낙하 사운드
 */
export function playVendingClunkSound() {
  if (typeof window === 'undefined' || isAudioMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // 1. Mechanical clunk low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // 2. Plastic capsule bounce rattle
    [0.08, 0.14].forEach((delay, i) => {
      const rattleOsc = ctx.createOscillator();
      const rattleGain = ctx.createGain();
      rattleOsc.type = 'sine';
      rattleOsc.frequency.setValueAtTime(320 - i * 60, now + delay);
      rattleGain.gain.setValueAtTime(0.4 - i * 0.15, now + delay);
      rattleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      rattleOsc.connect(rattleGain);
      rattleGain.connect(ctx.destination);
      rattleOsc.start(now + delay);
      rattleOsc.stop(now + delay + 0.09);
    });
  } catch (err) {
    console.error('Vending clunk failed', err);
  }
}

/**
 * 치이익-착! 35mm 수동 필름 와인딩 레버 래칫 기어 사운드
 */
export function playWindingAdvanceSound() {
  if (typeof window === 'undefined' || isAudioMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const clicks = 5; // 5-tooth ratchet sound
    for (let i = 0; i < clicks; i++) {
      const clickTime = now + (i * 0.045);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600 + i * 80, clickTime);

      gain.gain.setValueAtTime(0.25, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(clickTime);
      osc.stop(clickTime + 0.03);
    }

    // Final crisp ratchet lock '착!'
    const lockTime = now + (clicks * 0.045) + 0.02;
    const lockOsc = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lockOsc.type = 'triangle';
    lockOsc.frequency.setValueAtTime(950, lockTime);
    lockOsc.frequency.exponentialRampToValueAtTime(200, lockTime + 0.04);
    lockGain.gain.setValueAtTime(0.5, lockTime);
    lockGain.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.05);

    lockOsc.connect(lockGain);
    lockGain.connect(ctx.destination);
    lockOsc.start(lockTime);
    lockOsc.stop(lockTime + 0.06);
  } catch (err) {
    console.error('Winding sound failed', err);
  }
}

/**
 * 삑! 이중합치 / 초점 정렬 일치 확인음
 */
export function playFocusBeepSound() {
  if (typeof window === 'undefined' || isAudioMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (err) {
    console.error('Focus beep failed', err);
  }
}
