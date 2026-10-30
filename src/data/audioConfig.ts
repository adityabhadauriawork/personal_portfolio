/**
 * Central Audio Soundtrack Configuration
 *
 * Controls soundtrack path, availability flag, and fade envelope timings.
 * Connected to the 15-minute ambient soundtrack in `public/assets/audio/INTERSTELLAR.mp3`.
 */
export interface AudioConfig {
  soundtrackPath: string;
  isSoundtrackUploaded: boolean;
  trackTitle: string;
  defaultVolume: number;
  fadeInDurationSec: number;
  fadeOutDurationSec: number;
  fallbackAvailable: boolean;
}

export const audioConfig: AudioConfig = {
  // Exact path and filename case matching public/assets/audio/INTERSTELLAR.mp3
  soundtrackPath: '/assets/audio/INTERSTELLAR.mp3',

  // Active 15-minute ambient soundtrack
  isSoundtrackUploaded: true,

  // Display title for UI tooltips and notifications
  trackTitle: 'Interstellar — Ambient Soundtrack',

  // Playback volume (0.0 to 1.0)
  defaultVolume: 0.5,

  // Exponential fade timings (seconds)
  fadeInDurationSec: 1.8,
  fadeOutDurationSec: 1.2,

  // Graceful state flag
  fallbackAvailable: false,
};
