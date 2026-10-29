import { useEffect, useRef, useCallback } from 'react';
import { useExperience } from '../context/ExperienceContext';
import { windState } from '../components/hero/wind';

/**
 * Ambient Audio Hook — Peaceful Piano with Gentle Wind & Forest Ambience
 * Faithful to user specifications:
 * 1. Muted by default — playback starts ONLY when visitor explicitly enables sound.
 * 2. High-fidelity peaceful piano with gentle wind soundtrack (/assets/audio/ambient-piano-wind.wav).
 * 3. Smooth exponential fade-in (1.8s) and fade-out (1.2s) without clicking or volume spikes.
 * 4. Procedural dynamic wind layer subtly modulated by the 3D scene's live wind gusts.
 * 5. Respects soundVolume setting and sound toggle button seamlessly.
 */
export const useAmbientAudio = () => {
  const { isSoundActive, soundVolume } = useExperience();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const trackSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const trackGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Initialize Web Audio graph and audio element
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch((err) => console.warn('Audio resume error:', err));
      }
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master output gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // HTML5 Audio Element for the peaceful piano + wind track
      const audio = new Audio('/assets/audio/ambient-piano-wind.wav');
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audioElementRef.current = audio;

      const trackSource = ctx.createMediaElementSource(audio);
      trackSourceRef.current = trackSource;

      const trackGain = ctx.createGain();
      trackGain.gain.setValueAtTime(1.0, ctx.currentTime);
      trackGainRef.current = trackGain;

      trackSource.connect(trackGain);
      trackGain.connect(masterGain);

      // Procedural live wind accompaniment reacting to scene gusts
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.05;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.04, ctx.currentTime);
      windGainRef.current = windGain;

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      whiteNoise.start();

      // Dynamic wind gust modulation loop matching 3D landscape wind
      const updateWindModulation = () => {
        if (windGainRef.current && audioCtxRef.current) {
          const gust = windState ? windState.gust : 0;
          const targetWindLevel = 0.03 + gust * 0.07;
          windGainRef.current.gain.setTargetAtTime(targetWindLevel, audioCtxRef.current.currentTime, 0.2);
        }
        rafIdRef.current = requestAnimationFrame(updateWindModulation);
      };
      rafIdRef.current = requestAnimationFrame(updateWindModulation);

    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  }, []);

  // Handle active/inactive transitions with smooth exponential volume ramps
  useEffect(() => {
    if (isSoundActive) {
      initAudio();
      if (audioElementRef.current) {
        audioElementRef.current.play().catch((err) => console.warn('Audio play error:', err));
      }
      if (masterGainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const targetVol = Math.max(0.001, soundVolume * 0.38);
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        masterGainRef.current.gain.setValueAtTime(
          Math.max(0.0001, masterGainRef.current.gain.value),
          ctx.currentTime
        );
        masterGainRef.current.gain.exponentialRampToValueAtTime(targetVol, ctx.currentTime + 1.8);
      }
    } else {
      if (masterGainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        masterGainRef.current.gain.setValueAtTime(
          Math.max(0.0001, masterGainRef.current.gain.value),
          ctx.currentTime
        );
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        setTimeout(() => {
          if (!isSoundActive && audioElementRef.current) {
            audioElementRef.current.pause();
          }
        }, 1300);
      }
    }
  }, [isSoundActive, soundVolume, initAudio]);

  // Subtle interactive UI feedback chime
  const playInteractionChime = useCallback((frequency = 1046.5) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(frequency, ctx.currentTime);

      chimeGain.gain.setValueAtTime(0.04, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGainRef.current);

      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.38);
    } catch {
      // Ignore audio chime errors
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  return { playInteractionChime };
};
