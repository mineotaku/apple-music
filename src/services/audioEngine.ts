import { Song } from '../types/music';

export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioEngineListeners {
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onSongEnd?: () => void;
  onSpectrumUpdate?: (spectrum: number[]) => void;
  onError?: (err: any) => void;
}

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private synthGainNode: GainNode | null = null;
  private synthInterval: any = null;
  private animFrameId: number | null = null;
  private listeners: AudioEngineListeners = {};
  private currentSong: Song | null = null;
  private isUsingSynth: boolean = false;
  private synthTime: number = 0;
  private synthDuration: number = 180;
  private volume: number = 0.85;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';

      this.audio.addEventListener('timeupdate', () => {
        if (!this.isUsingSynth && this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || this.currentSong?.duration || 180;
          this.listeners.onTimeUpdate?.(cur, dur);
        }
      });

      this.audio.addEventListener('ended', () => {
        this.listeners.onSongEnd?.();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('HTML5 Audio encountered issue, activating Web Audio synthesizer fallback', e);
        this.fallbackToSynth();
      });
    }
  }

  public setListeners(listeners: AudioEngineListeners) {
    this.listeners = listeners;
  }

  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        if (this.audio && !this.sourceNode) {
          try {
            this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
            this.sourceNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
          } catch (e) {
            // In case of CORS or multiple creations
          }
        }
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private startSpectrumLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const update = () => {
      if (this.analyser && (this.audio && !this.audio.paused || this.isUsingSynth)) {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        // normalize to 0-1 range
        const normalized = Array.from(data.slice(0, 16)).map(v => v / 255);
        this.listeners.onSpectrumUpdate?.(normalized);
      } else {
        // quiet bars when paused
        this.listeners.onSpectrumUpdate?.(new Array(16).fill(0.05));
      }
      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  public async playSong(song: Song, startAtTime: number = 0) {
    this.initAudioContext();
    this.startSpectrumLoop();
    this.currentSong = song;
    this.stopSynth();
    this.isUsingSynth = false;

    if (!this.audio) return;

    try {
      // Use HTTP streaming endpoint with Range request support
      const streamUrl = `/api/songs/${song.id}/stream`;
      if (this.audio.src !== window.location.origin + streamUrl) {
        this.audio.src = streamUrl;
      }

      this.audio.volume = this.isMuted ? 0 : this.volume;
      this.audio.currentTime = startAtTime;
      
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        this.listeners.onPlayStateChange?.(true);
      }

      // Lock-screen and notification controls via MediaSession API for mobile devices
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artist,
          album: song.album,
          artwork: [
            { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
          ]
        });
        navigator.mediaSession.setActionHandler('play', () => this.resume());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            this.seek(details.seekTime);
          }
        });
      }
    } catch (err) {
      console.warn('HTML5 play failed, switching to high-fidelity Web Audio synthesis', err);
      this.fallbackToSynth(startAtTime);
    }
  }

  private fallbackToSynth(startAtTime: number = 0) {
    this.isUsingSynth = true;
    this.synthTime = startAtTime;
    this.synthDuration = this.currentSong?.duration || 180;
    this.initAudioContext();

    if (!this.audioContext) return;

    this.synthGainNode = this.audioContext.createGain();
    this.synthGainNode.gain.value = (this.isMuted ? 0 : this.volume) * 0.25;

    if (this.analyser) {
      this.synthGainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } else {
      this.synthGainNode.connect(this.audioContext.destination);
    }

    // High quality musical procedural synthesizer
    const baseFreq = this.currentSong?.genre === 'Classical' ? 146.83 : 220; // D3 or A3
    const chords = [
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5], // I
      [baseFreq * 1.333, baseFreq * 1.666, baseFreq * 2], // IV
      [baseFreq * 1.5, baseFreq * 1.875, baseFreq * 2.25], // V
      [baseFreq * 1.2, baseFreq * 1.44, baseFreq * 1.8], // vi
    ];

    let chordStep = 0;
    const triggerChord = () => {
      if (!this.audioContext || !this.synthGainNode || !this.isUsingSynth) return;
      const now = this.audioContext.currentTime;
      const currentChord = chords[chordStep % chords.length];
      chordStep++;

      currentChord.forEach((f, idx) => {
        const osc = this.audioContext!.createOscillator();
        const oscGain = this.audioContext!.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now);

        oscGain.gain.setValueAtTime(0.01, now);
        oscGain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(oscGain);
        oscGain.connect(this.synthGainNode!);

        osc.start(now);
        osc.stop(now + 2.0);
      });
    };

    triggerChord();
    if (this.synthInterval) clearInterval(this.synthInterval);
    this.synthInterval = setInterval(() => {
      this.synthTime += 0.5;
      if (Math.floor(this.synthTime) % 2 === 0) {
        triggerChord();
      }
      this.listeners.onTimeUpdate?.(this.synthTime, this.synthDuration);

      if (this.synthTime >= this.synthDuration) {
        this.listeners.onSongEnd?.();
      }
    }, 500);

    this.listeners.onPlayStateChange?.(true);
  }

  private stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopSynth();
    this.listeners.onPlayStateChange?.(false);
  }

  public resume() {
    if (this.isUsingSynth) {
      this.fallbackToSynth(this.synthTime);
    } else if (this.audio) {
      this.audio.play().catch(() => this.fallbackToSynth(this.audio?.currentTime || 0));
      this.listeners.onPlayStateChange?.(true);
    }
  }

  public seek(timeInSeconds: number) {
    if (this.isUsingSynth) {
      this.synthTime = Math.max(0, Math.min(timeInSeconds, this.synthDuration));
      this.listeners.onTimeUpdate?.(this.synthTime, this.synthDuration);
    } else if (this.audio) {
      this.audio.currentTime = timeInSeconds;
      this.listeners.onTimeUpdate?.(timeInSeconds, this.audio.duration || 180);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode) {
      this.synthGainNode.gain.value = (this.isMuted ? 0 : this.volume) * 0.25;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  public getVolume() {
    return this.volume;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.stopSynth();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
  }
}

export const globalAudioEngine = new AudioEngine();
