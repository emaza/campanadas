class AudioService {
  private context: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  public init() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }
    // Pre-warm the context
    try {
      const emptySource = ctx.createBufferSource();
      emptySource.start();
      emptySource.stop();
    } catch(e) {}
  }

  // Sonido mecánico/musical para cuando baja la bola
  public playCarillon() {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    // Create a repetitive "tinkling" / mechanical sound
    for(let i = 0; i < 10; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.value = 800 + Math.random() * 400;
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(0, t + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.05, t + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.5);
    }
  }

  // Sonido de Los Cuartos (Doble tono: Ding-Dong, más agudo que la campanada)
  public playQuarter() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // First Note (High)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 600; // Higher pitch
    osc1.type = 'sine';
    
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.4, t + 0.05); // Boosted volume
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 1.5);

    // Second Note (Lower) - Plays 0.4s later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 400; // Lower pitch
    osc2.type = 'sine';
    
    gain2.gain.setValueAtTime(0, t + 0.4);
    gain2.gain.linearRampToValueAtTime(0.4, t + 0.45); // Boosted volume
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.4);
    osc2.stop(t + 2.5);
  }

  public playChime() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // Fundamental Frequency: 200Hz (Clean, deep body)
    const fundamental = 200; 

    // 1. Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.8, t); // Boosted volume to 0.8
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 12.0); // Very long fade out
    masterGain.connect(ctx.destination);

    // 2. Tremolo Stage
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 1.0;
    tremoloGain.connect(masterGain);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 4.5; 
    
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.value = 0.15; 
    
    lfo.connect(lfoAmp);
    lfoAmp.connect(tremoloGain.gain); 
    lfo.start(t);
    lfo.stop(t + 12.0);

    // 3. Bell Partials
    const partials = [
      { ratio: 0.5, amp: 0.15, decay: 6.0 },
      { ratio: 1.0, amp: 0.6,  decay: 5.0 },
      { ratio: 1.2, amp: 0.25, decay: 3.5 },
      { ratio: 1.5, amp: 0.2,  decay: 2.5 },
      { ratio: 2.0, amp: 0.15, decay: 2.0 },
      { ratio: 2.5, amp: 0.1,  decay: 1.5 },
      { ratio: 4.0, amp: 0.05, decay: 1.0 },
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamental * p.ratio;
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.linearRampToValueAtTime(p.amp, t + 0.05); 
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + p.decay);

      osc.connect(oscGain);
      oscGain.connect(tremoloGain); 
      
      osc.start(t);
      osc.stop(t + 12.0);
    });

    // 4. Impact Strike
    const bufferSize = ctx.sampleRate * 0.04; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000; 

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t); // Slightly louder click
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(tremoloGain);
    noise.start(t);
  }

  public playFireworkExplosion() {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1); 
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t); 
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.playbackRate.value = 0.8 + Math.random() * 0.4;
    noise.start(t);
  }

  public playCelebrationCrowd() {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    const duration = 15.0; 

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 1); 
    
    for(let i = 1; i < duration - 1; i += 0.5) {
        gain.gain.linearRampToValueAtTime(0.2 + Math.random() * 0.2, t + i);
    }
    gain.gain.linearRampToValueAtTime(0, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);

    const numShouts = 40;
    for (let i = 0; i < numShouts; i++) {
        const start = t + Math.random() * (duration - 2);
        this.playHappyShout(start);
    }
  }

  public playGulp() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  private playHappyShout(startTime: number) {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const type = Math.random();
      osc.type = type > 0.6 ? 'sawtooth' : (type > 0.3 ? 'triangle' : 'sine');

      const freqStart = 600 + Math.random() * 900;
      const freqEnd = freqStart + (Math.random() * 600 - 200); 
      const dur = 0.2 + Math.random() * 0.6; 

      osc.frequency.setValueAtTime(freqStart, startTime);
      osc.frequency.linearRampToValueAtTime(freqEnd, startTime + dur);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05); 
      gain.gain.linearRampToValueAtTime(0, startTime + dur);

      if (osc.type === 'sawtooth') {
          const lpf = ctx.createBiquadFilter();
          lpf.type = 'lowpass';
          lpf.frequency.value = 2000;
          osc.connect(lpf);
          lpf.connect(gain);
      } else {
          osc.connect(gain);
      }

      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
  }
}

export default new AudioService();