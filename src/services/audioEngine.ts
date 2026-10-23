import type { SoundType, TimeSignature, Subdivision } from '../types/index.ts';

export interface BeatEvent {
  beatIndex: number;          // 0 to numerator - 1
  subBeatIndex: number;       // 0 to subdivision - 1
  isAccent: boolean;          // true if beat 1 and accent enabled
  isMainBeat: boolean;        // true if subBeatIndex === 0
  time: number;
}

type BeatCallback = (event: BeatEvent) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private isRunning: boolean = false;
  private timerId: number | null = null;
  private animFrameId: number | null = null;

  // Metronome parameters
  private bpm: number = 120;
  private timeSignature: TimeSignature = { numerator: 4, denominator: 4 };
  private subdivision: Subdivision = 1;
  private soundType: SoundType = 'digital';
  private accentFirstBeat: boolean = true;
  private volume: number = 0.8;

  // Scheduling state (Chris Wilson's Web Audio Metronome pattern)
  private nextNoteTime: number = 0.0;
  private currentStep: number = 0; // step count within the measure (0 to numerator * subdivision - 1)
  private scheduleAheadTime: number = 0.1; // seconds ahead to schedule (100ms)
  private lookaheadIntervalMs: number = 25; // timer check interval in ms

  // Note visual sync queue
  private notesInQueue: BeatEvent[] = [];
  private beatListeners: Set<BeatCallback> = new Set();

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private initAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.warn('Could not resume AudioContext', e));
    }
    return this.ctx;
  }

  public subscribe(callback: BeatCallback): () => void {
    this.beatListeners.add(callback);
    return () => {
      this.beatListeners.delete(callback);
    };
  }

  private notifyBeat(event: BeatEvent) {
    this.beatListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in beat listener callback', err);
      }
    });
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public configure(params: {
    bpm?: number;
    timeSignature?: TimeSignature;
    subdivision?: Subdivision;
    soundType?: SoundType;
    accentFirstBeat?: boolean;
  }) {
    if (params.bpm !== undefined) {
      this.bpm = Math.max(20, Math.min(320, params.bpm));
    }
    if (params.timeSignature) {
      this.timeSignature = { ...params.timeSignature };
    }
    if (params.subdivision) {
      this.subdivision = params.subdivision;
    }
    if (params.soundType) {
      this.soundType = params.soundType;
    }
    if (params.accentFirstBeat !== undefined) {
      this.accentFirstBeat = params.accentFirstBeat;
    }
  }

  /**
   * Calculates the interval between subdivision ticks in seconds
   */
  private getStepDuration(): number {
    // 60 / bpm = length of one quarter note in seconds.
    // If denominator is 4, 1 beat = 1 quarter note.
    // If denominator is 8, 1 beat = 1 eighth note = 0.5 quarter note.
    const beatValueRelativeToQuarter = 4 / this.timeSignature.denominator;
    const beatDuration = (60.0 / this.bpm) * beatValueRelativeToQuarter;
    return beatDuration / this.subdivision;
  }

  public async start(): Promise<void> {
    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05; // slight initial offset for immediate launch
    this.notesInQueue = [];

    // Schedule loop
    this.timerId = window.setInterval(() => {
      this.scheduler();
    }, this.lookaheadIntervalMs);

    // Visual synchronization loop
    const checkVisualQueue = () => {
      if (!this.isRunning) return;
      const currentTime = ctx.currentTime;

      while (this.notesInQueue.length > 0 && this.notesInQueue[0].time <= currentTime) {
        const event = this.notesInQueue.shift()!;
        this.notifyBeat(event);
      }

      this.animFrameId = requestAnimationFrame(checkVisualQueue);
    };

    this.animFrameId = requestAnimationFrame(checkVisualQueue);
  }

  public stop(): void {
    this.isRunning = false;

    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.notesInQueue = [];
    this.currentStep = 0;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  private scheduler(): void {
    if (!this.ctx) return;

    // While there are notes that will need to play before the next interval, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }
  }

  private advanceStep(): void {
    const stepDuration = this.getStepDuration();
    this.nextNoteTime += stepDuration;

    const totalStepsInMeasure = this.timeSignature.numerator * this.subdivision;
    this.currentStep = (this.currentStep + 1) % totalStepsInMeasure;
  }

  private scheduleNote(step: number, time: number): void {
    if (!this.ctx || !this.masterGain) return;

    const beatIndex = Math.floor(step / this.subdivision);
    const subBeatIndex = step % this.subdivision;
    const isMainBeat = subBeatIndex === 0;
    const isAccent = isMainBeat && beatIndex === 0 && this.accentFirstBeat;

    // Enqueue for visual beat indicator synchronization
    this.notesInQueue.push({
      beatIndex,
      subBeatIndex,
      isAccent,
      isMainBeat,
      time
    });

    // Synthesize audio click
    this.playClickSound(this.soundType, time, isAccent, isMainBeat);
  }

  /**
   * Sound synthesis engine using pure Web Audio API
   */
  private playClickSound(
    type: SoundType,
    time: number,
    isAccent: boolean,
    isMainBeat: boolean
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const dest = this.masterGain;

    switch (type) {
      case 'woodblock': {
        // Resonant wood block synth with quick downward pitch envelope
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.Q.value = 8.0;

        const baseFreq = isAccent ? 1400 : isMainBeat ? 950 : 700;
        const volumeLevel = isAccent ? 1.0 : isMainBeat ? 0.75 : 0.4;
        const duration = isMainBeat ? 0.05 : 0.03;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 1.5, time);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.015);

        filter.frequency.setValueAtTime(baseFreq, time);

        gain.gain.setValueAtTime(volumeLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration + 0.01);
        break;
      }

      case 'classic': {
        // Mechanical clock / metronome click: short impulse with bandpass noise & mechanical wood tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = isAccent ? 1200 : isMainBeat ? 800 : 500;
        const volumeLevel = isAccent ? 0.9 : isMainBeat ? 0.7 : 0.35;
        const duration = 0.025;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

        gain.gain.setValueAtTime(volumeLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration + 0.01);
        break;
      }

      case 'rimshot': {
        // Crisp drumstick / rimshot sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = isAccent ? 2400 : isMainBeat ? 1800 : 1200;

        const freq = isAccent ? 2600 : isMainBeat ? 2000 : 1500;
        const volumeLevel = isAccent ? 1.0 : isMainBeat ? 0.8 : 0.4;
        const duration = 0.035;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

        gain.gain.setValueAtTime(volumeLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration + 0.01);
        break;
      }

      case 'beep': {
        // Clean electronic pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = isAccent ? 2200 : isMainBeat ? 1200 : 800;
        const volumeLevel = isAccent ? 0.9 : isMainBeat ? 0.7 : 0.35;
        const duration = isMainBeat ? 0.05 : 0.03;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(volumeLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration + 0.01);
        break;
      }

      case 'digital':
      default: {
        // Modern crisp digital click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = isAccent ? 1760 : isMainBeat ? 880 : 440;
        const volumeLevel = isAccent ? 1.0 : isMainBeat ? 0.75 : 0.4;
        const duration = isMainBeat ? 0.04 : 0.025;

        osc.type = isAccent ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(volumeLevel, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration + 0.01);
        break;
      }
    }
  }

  /**
   * Preview a single click note immediately (useful for sound selection)
   */
  public previewClick(soundType?: SoundType, isAccent: boolean = false): void {
    const ctx = this.initAudioContext();
    const type = soundType || this.soundType;
    this.playClickSound(type, ctx.currentTime, isAccent, true);
  }
}

// Singleton audio engine instance
export const audioEngine = new AudioEngine();
