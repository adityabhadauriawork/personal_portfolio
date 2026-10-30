import { useEffect, useCallback } from 'react';
import { useExperience } from '../context/ExperienceContext';
import { audioConfig } from '../data/audioConfig';
import { windState } from '../components/hero/wind';

/**
 * Module-level singleton state so that multiple callers of `useAmbientAudio()`
 * (e.g., App.tsx and SoundToggle.tsx) never instantiate duplicate HTMLAudioElements,
 * AudioContexts, or animation loops.
 */
interface AudioEngineSingleton {
  ctx: AudioContext | null;
  audio: HTMLAudioElement | null;
  trackSource: MediaElementAudioSourceNode | null;
  trackGain: GainNode | null;
  masterGain: GainNode | null;
  windGain: GainNode | null;
  rafId: number | null;
  pauseTimerId: number | null;
  isSoundActiveCurrent: boolean;
}

const engine: AudioEngineSingleton = {
  ctx: null,
  audio: null,
  trackSource: null,
  trackGain: null,
  masterGain: null,
  windGain: null,
  rafId: null,
  pauseTimerId: null,
  isSoundActiveCurrent: false,
};

declare global {
  interface Window {
    __portfolioAudioElement?: HTMLAudioElement | null;
    __portfolioAudioInstanceCount?: number;
  }
}

function ensureAudioEngine(): void {
  if (!audioConfig.isSoundtrackUploaded) return;

  if (engine.ctx && engine.audio) {
    if (engine.ctx.state === 'suspended') {
      engine.ctx.resume().catch((err) => console.warn('Audio resume error:', err));
    }
    return;
  }

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    engine.ctx = ctx;

    // Master output gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);
    engine.masterGain = masterGain;

    // Single HTML5 Audio Element for the 15-minute soundtrack with native loop
    const audio = new Audio(audioConfig.soundtrackPath);
    audio.loop = true;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    engine.audio = audio;

    if (typeof window !== 'undefined') {
      window.__portfolioAudioElement = audio;
      window.__portfolioAudioInstanceCount = (window.__portfolioAudioInstanceCount || 0) + 1;
    }

    const trackSource = ctx.createMediaElementSource(audio);
    engine.trackSource = trackSource;

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(1.0, ctx.currentTime);
    engine.trackGain = trackGain;

    trackSource.connect(trackGain);
    trackGain.connect(masterGain);

    // Subtle procedural live wind accompaniment reacting to 3D scene gusts
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, ctx.currentTime);
    windFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.025, ctx.currentTime);
    engine.windGain = windGain;

    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);

    whiteNoise.start();

    const updateWindModulation = () => {
      if (engine.windGain && engine.ctx && engine.isSoundActiveCurrent && !document.hidden) {
        const gust = windState ? windState.gust : 0;
        const targetWindLevel = 0.02 + gust * 0.05;
        engine.windGain.gain.setTargetAtTime(targetWindLevel, engine.ctx.currentTime, 0.25);
      }
      engine.rafId = requestAnimationFrame(updateWindModulation);
    };
    engine.rafId = requestAnimationFrame(updateWindModulation);
  } catch (err) {
    console.warn('Web Audio initialization error:', err);
  }
}

export function playInteractionChime(frequency = 1046.5): void {
  if (!engine.ctx || !engine.masterGain) return;
  try {
    const ctx = engine.ctx;
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(frequency, ctx.currentTime);

    chimeGain.gain.setValueAtTime(0.04, ctx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(engine.masterGain);

    chimeOsc.start();
    chimeOsc.stop(ctx.currentTime + 0.38);
  } catch {
    // Ignore audio chime errors
  }
}

/**
 * Ambient Audio Hook — Synchronizes ExperienceContext sound state with the
 * singleton Web Audio & HTMLAudioElement engine.
 */
export const useAmbientAudio = () => {
  const { isSoundActive, soundVolume } = useExperience();

  // Synchronize active/inactive transitions and volume ramps
  useEffect(() => {
    if (!audioConfig.isSoundtrackUploaded) return;

    engine.isSoundActiveCurrent = isSoundActive;

    if (engine.pauseTimerId !== null) {
      window.clearTimeout(engine.pauseTimerId);
      engine.pauseTimerId = null;
    }

    if (isSoundActive) {
      ensureAudioEngine();
      if (engine.ctx && engine.ctx.state === 'suspended') {
        engine.ctx.resume().catch(() => {});
      }
      if (engine.audio) {
        engine.audio.loop = true;
        if (engine.audio.paused) {
          engine.audio.play().catch((err) => console.warn('Audio play error:', err));
        }
      }
      if (engine.masterGain && engine.ctx) {
        const ctx = engine.ctx;
        const targetVol = Math.max(0.001, soundVolume * 0.45);
        engine.masterGain.gain.cancelScheduledValues(ctx.currentTime);
        engine.masterGain.gain.setValueAtTime(
          Math.max(0.0001, engine.masterGain.gain.value),
          ctx.currentTime
        );
        engine.masterGain.gain.exponentialRampToValueAtTime(
          targetVol,
          ctx.currentTime + audioConfig.fadeInDurationSec
        );
      }
    } else {
      if (engine.masterGain && engine.ctx) {
        const ctx = engine.ctx;
        engine.masterGain.gain.cancelScheduledValues(ctx.currentTime);
        engine.masterGain.gain.setValueAtTime(
          Math.max(0.0001, engine.masterGain.gain.value),
          ctx.currentTime
        );
        engine.masterGain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + audioConfig.fadeOutDurationSec
        );
        engine.pauseTimerId = window.setTimeout(() => {
          if (!engine.isSoundActiveCurrent && engine.audio && !engine.audio.paused) {
            engine.audio.pause();
          }
          engine.pauseTimerId = null;
        }, audioConfig.fadeOutDurationSec * 1000 + 80);
      } else if (engine.audio && !engine.audio.paused) {
        engine.audio.pause();
      }
    }
  }, [isSoundActive, soundVolume]);

  // Tab visibility management: pause when tab hidden, resume smoothly when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!engine.isSoundActiveCurrent || !engine.audio) return;
      if (document.hidden) {
        engine.audio.pause();
      } else {
        if (engine.ctx && engine.ctx.state === 'suspended') {
          engine.ctx.resume().catch(() => {});
        }
        engine.audio.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const triggerChime = useCallback((frequency = 1046.5) => {
    playInteractionChime(frequency);
  }, []);

  return { playInteractionChime: triggerChime };
};
