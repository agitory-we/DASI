// Web Audio API based Realistic Camera Shutter Synthesizer
export function playShutterSound(type: 'slr' | 'leaf' | 'compact' | 'ccd' = 'slr') {
  if (typeof window === 'undefined') return;

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
  } catch (err) {
    console.error('Audio synthesis failed', err);
  }
}
