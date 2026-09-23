/**
 * CRICKET RUSH — Procedural Web Audio Engine
 * Zero external audio files required — synthesizes crisp cricket audio directly via Web Audio API.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
    this.initDone = false;
  }

  init() {
    if (this.initDone) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initDone = true;
      }
    } catch (e) {
      console.warn("AudioContext could not be initialized:", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  // Helper for white/pink noise buffer
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. Bat Hit Sound (Quality: "PERFECT", "GREAT", "GOOD", "POOR", "MISS")
  playBatHit(quality = "GOOD") {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    
    // Wooden core knock (Sine pitch drop)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    let baseFreq = 220;
    let endFreq = 60;
    let duration = 0.09;
    let volume = 0.8;

    if (quality === "PERFECT") {
      baseFreq = 340;
      endFreq = 80;
      volume = 1.0;
      duration = 0.13;
    } else if (quality === "GREAT") {
      baseFreq = 280;
      endFreq = 70;
      volume = 0.9;
      duration = 0.11;
    } else if (quality === "POOR") {
      baseFreq = 160;
      endFreq = 50;
      volume = 0.5;
      duration = 0.07;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);

    // High frequency wood crack (Noise burst with bandpass filter)
    const noiseBuf = this.createNoiseBuffer(0.08);
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(quality === "PERFECT" ? 3200 : 2200, now);
      filter.Q.setValueAtTime(4.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(quality === "PERFECT" ? 0.9 : 0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (quality === "PERFECT" ? 0.08 : 0.05));

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.08);
    }
  }

  // 2. Ball Pitch Bounce
  playBallBounce() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 3. Bat Swoosh (Missed ball)
  playBatSwoosh() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(0.2);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.2);
  }

  // 4. Crowd Cheering (Simulated stadium roar)
  playCrowdCheer(intensity = "high", duration = 2.0) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(duration);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(1800, now + duration * 0.4);
    filter.frequency.linearRampToValueAtTime(800, now + duration);

    const gain = this.ctx.createGain();
    const peakVol = intensity === "huge" ? 0.65 : intensity === "high" ? 0.45 : 0.25;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(peakVol, now + 0.3);
    gain.gain.linearRampToValueAtTime(peakVol * 0.7, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 5. Crowd Gasp / Disappointment
  playCrowdGasp() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(1.2);
    if (!noiseBuf) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.8);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 1.0);
  }

  // 6. Wicket Crash (Stumps & Bails shatter)
  playWicket() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Heavy stump crash
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // High wood splintering clatter
    for (let i = 0; i < 3; i++) {
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      const delay = i * 0.04;
      click.type = "square";
      click.frequency.setValueAtTime(800 + i * 400, now + delay);
      click.frequency.exponentialRampToValueAtTime(200, now + delay + 0.08);
      clickGain.gain.setValueAtTime(0.4, now + delay);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(now + delay);
      click.stop(now + delay + 0.08);
    }

    this.playCrowdGasp();
  }

  // 7. Four Fanfare
  playFourFanfare() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.35);
    });

    this.playCrowdCheer("high", 2.2);
  }

  // 8. Six Mega Fanfare
  playSixFanfare() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.07;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, start);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2500, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.5);
    });

    this.playCrowdCheer("huge", 3.0);
  }

  // 9. Umpire Whistle / Decision Beep
  playWhistle() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(2400, now);
    osc2.frequency.setValueAtTime(2420, now); // Beating effect

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  // 10. Sprint Footstep
  playFootstep() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110 + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 11. Run Safe Chime
  playSafeChime() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    [587.33, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  // 12. UI Click Sound
  playClick() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 13. Championship Victory Fanfare
  playTrophyFanfare() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    // Triumphant progression
    const chords = [
      { notes: [523.25, 659.25, 783.99], time: 0.0, dur: 0.3 }, // C
      { notes: [587.33, 698.46, 880.00], time: 0.32, dur: 0.3 }, // Dm
      { notes: [659.25, 783.99, 987.77], time: 0.64, dur: 0.4 }, // Em
      { notes: [783.99, 987.77, 1174.66], time: 1.05, dur: 0.8 }, // G
      { notes: [1046.50, 1318.51, 1567.98], time: 1.85, dur: 1.5 } // High C Major
    ];

    chords.forEach(c => {
      c.notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + c.time;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, start);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + c.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + c.dur);
      });
    });

    this.playCrowdCheer("huge", 4.0);
  }
}

// Global Sound Instance
window.cricketSound = new SoundEngine();
