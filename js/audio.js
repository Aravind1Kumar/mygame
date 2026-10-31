// 8-bit Procedural Sound Engine using Web Audio API
class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.motorOsc = null;
    this.motorGain = null;
    this.motorFilter = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initMotorHum();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.motorGain) {
      this.motorGain.gain.setValueAtTime(this.muted ? 0 : 0.03, this.ctx ? this.ctx.currentTime : 0);
    }
    return !this.muted;
  }

  initMotorHum() {
    if (!this.ctx) return;
    try {
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();
      this.motorFilter = this.ctx.createBiquadFilter();

      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.motorFilter.type = 'lowpass';
      this.motorFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.motorOsc.connect(this.motorFilter);
      this.motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start();
    } catch (e) {
      console.warn("Motor hum init failed:", e);
    }
  }

  updateMotorHum(rpmPercent, isFluttering) {
    if (!this.ctx || this.muted || !this.motorGain) return;
    const now = this.ctx.currentTime;
    const targetFreq = 40 + rpmPercent * 160;
    const targetVol = isFluttering ? 0.08 : (0.01 + rpmPercent * 0.04);

    this.motorOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
    this.motorGain.gain.setTargetAtTime(targetVol, now, 0.05);
    this.motorFilter.frequency.setTargetAtTime(120 + rpmPercent * 450, now, 0.05);
  }

  playJump() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playFlutter() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.05);
    osc.frequency.linearRampToValueAtTime(280, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playWatt() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    gain.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
  }

  playBlockHit() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBlockBreak() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    // White noise blast for debris
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playStomp() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPowerUp() {
    if (!this.ctx || this.muted) return;
    const notes = [330, 392, 494, 659, 784, 988]; // E4, G4, B4, E5, G5, B5
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    });
  }

  playDeath() {
    if (!this.ctx || this.muted) return;
    const notes = [494, 440, 392, 349, 330, 261];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    });
  }

  playWin() {
    if (!this.ctx || this.muted) return;
    const melody = [
      { f: 261.63, d: 0.12 }, // C4
      { f: 329.63, d: 0.12 }, // E4
      { f: 392.00, d: 0.12 }, // G4
      { f: 523.25, d: 0.18 }, // C5
      { f: 392.00, d: 0.10 }, // G4
      { f: 523.25, d: 0.45 }, // C5
    ];
    let offset = 0;
    melody.forEach(note => {
      const now = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + note.d);
      offset += note.d + 0.04;
    });
  }
}

window.retroAudio = new RetroAudioEngine();
