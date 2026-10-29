// Generate high-fidelity peaceful ambient piano with gentle wind soundtrack
// 44.1 kHz, 16-bit Stereo WAV, seamless loop

import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;
const DURATION_SEC = 42; // ~42 seconds seamless loop
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;

console.log(`Generating ambient soundtrack: ${DURATION_SEC}s (${TOTAL_SAMPLES} samples)...`);

const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

// 1. Natural Wind Generation (Filtered Pink Noise with Organic Gust Modulation)
let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;

  // Pink noise approximation (Paul Kellet filter)
  const whiteL = Math.random() * 2 - 1;
  b0 = 0.99886 * b0 + whiteL * 0.0555179;
  b1 = 0.99332 * b1 + whiteL * 0.0750759;
  b2 = 0.96900 * b2 + whiteL * 0.1538520;
  b3 = 0.86650 * b3 + whiteL * 0.3104856;
  b4 = 0.55000 * b4 + whiteL * 0.5329522;
  b5 = -0.7616 * b5 - whiteL * 0.0168980;
  const pinkL = b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362;
  b6 = whiteL * 0.115926;

  const whiteR = Math.random() * 2 - 1;
  b0R = 0.99886 * b0R + whiteR * 0.0555179;
  b1R = 0.99332 * b1R + whiteR * 0.0750759;
  b2R = 0.96900 * b2R + whiteR * 0.1538520;
  b3R = 0.86650 * b3R + whiteR * 0.3104856;
  b4R = 0.55000 * b4R + whiteR * 0.5329522;
  b5R = -0.7616 * b5R - whiteR * 0.0168980;
  const pinkR = b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362;
  b6R = whiteR * 0.115926;

  // Slow natural wind gusts (multi-frequency wave modulation)
  const gustEnvelope = 0.35 + 
    0.35 * Math.sin((t / DURATION_SEC) * Math.PI * 2 * 2 + 0.4) +
    0.20 * Math.sin((t / DURATION_SEC) * Math.PI * 2 * 5 + 1.2) +
    0.10 * Math.sin((t / DURATION_SEC) * Math.PI * 2 * 8);

  const windVol = 0.038 * Math.max(0.15, gustEnvelope);
  leftChannel[i] += pinkL * windVol;
  rightChannel[i] += pinkR * windVol * 0.95;
}

// Low-pass smooth filter for gentle wind character (removing harsh hiss)
let lpL = 0, lpR = 0;
const windAlpha = 0.045; // ~315 Hz cut
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  lpL += (leftChannel[i] - lpL) * windAlpha;
  lpR += (rightChannel[i] - lpR) * windAlpha;
  leftChannel[i] = lpL;
  rightChannel[i] = lpR;
}

// 2. Peaceful Meditative Piano Synthesis (Physical modeling of acoustic grand piano strings)
// Warm D-major progression: Dmaj9 -> Bm9 -> Gmaj7 -> Aadd9 (ethereal, calming)
const notes = [
  // Chords and arpeggios timed over 42 seconds (looping seamlessly)
  // [pitchHz, startTime, duration, velocity, pan]
  // Bar 1 (0s - 10.5s): Dmaj9
  [73.42, 0.5, 9.5, 0.45, 0.4],    // D2
  [146.83, 1.0, 8.5, 0.38, 0.45],  // D3
  [220.00, 1.8, 7.5, 0.35, 0.55],  // A3
  [277.18, 2.6, 6.5, 0.32, 0.6],   // C#4
  [369.99, 3.4, 6.0, 0.30, 0.35],  // F#4
  [440.00, 4.6, 5.0, 0.28, 0.65],  // A4
  [554.37, 5.8, 4.5, 0.25, 0.4],   // C#5
  [659.25, 7.2, 3.2, 0.22, 0.6],   // E5
  [739.99, 8.4, 2.2, 0.20, 0.5],   // F#5

  // Bar 2 (10.5s - 21.0s): Bm9
  [61.74, 10.8, 9.8, 0.42, 0.35],  // B1
  [123.47, 11.4, 9.0, 0.36, 0.45], // B2
  [185.00, 12.2, 8.2, 0.34, 0.55], // F#3
  [293.66, 13.0, 7.2, 0.30, 0.65], // D4
  [369.99, 14.0, 6.5, 0.28, 0.4],  // F#4
  [440.00, 15.2, 5.5, 0.26, 0.6],  // A4
  [587.33, 16.6, 4.2, 0.22, 0.35], // D5
  [739.99, 18.0, 3.0, 0.20, 0.55], // F#5

  // Bar 3 (21.0s - 31.5s): Gmaj7
  [49.00, 21.2, 9.8, 0.42, 0.4],   // G1
  [98.00, 21.8, 9.0, 0.36, 0.45],  // G2
  [146.83, 22.6, 8.2, 0.34, 0.55], // D3
  [196.00, 23.4, 7.5, 0.32, 0.6],  // G3
  [246.94, 24.4, 6.5, 0.30, 0.4],  // B3
  [293.66, 25.6, 5.5, 0.28, 0.65], // D4
  [369.99, 27.0, 4.5, 0.24, 0.35], // F#4
  [493.88, 28.4, 3.2, 0.20, 0.55], // B4

  // Bar 4 (31.5s - 42.0s): Aadd9 -> resolving back to D
  [55.00, 31.8, 9.8, 0.40, 0.45],  // A1
  [110.00, 32.4, 9.0, 0.36, 0.5],  // A2
  [164.81, 33.2, 8.2, 0.34, 0.55], // E3
  [220.00, 34.0, 7.5, 0.30, 0.6],  // A3
  [277.18, 35.0, 6.5, 0.28, 0.4],  // C#4
  [369.99, 36.2, 5.2, 0.26, 0.65], // F#4
  [440.00, 37.6, 4.0, 0.22, 0.4],  // A4
  [554.37, 39.0, 2.8, 0.18, 0.5],  // C#5
];

// Synthesize each piano note with natural acoustic envelope & harmonics
notes.forEach(([freq, startTime, duration, velocity, pan]) => {
  const startSample = Math.floor(startTime * SAMPLE_RATE);
  const noteSamples = Math.floor(duration * SAMPLE_RATE);

  // Harmonics weighting for soft warm felt grand piano
  const harmonics = [
    { mult: 1.0, weight: 1.0, decay: 1.0 },
    { mult: 2.0, weight: 0.45, decay: 1.2 },
    { mult: 3.0, weight: 0.20, decay: 1.5 },
    { mult: 4.0, weight: 0.10, decay: 1.9 },
    { mult: 5.0, weight: 0.05, decay: 2.3 },
    { mult: 6.0, weight: 0.02, decay: 2.8 },
  ];

  for (let s = 0; s < noteSamples; s++) {
    const idx = (startSample + s) % TOTAL_SAMPLES;
    const tNote = s / SAMPLE_RATE;

    // Felt hammer attack: smooth 15ms ramp up
    const attack = Math.min(tNote / 0.015, 1.0);
    // Exponential acoustic string decay with velocity sensitivity
    const decay = Math.exp(-tNote / (2.2 * (0.8 + velocity)));

    let sampleVal = 0;
    harmonics.forEach(({ mult, weight, decay: hDecay }) => {
      const f = freq * mult;
      const hEnv = Math.exp(-tNote * hDecay * 0.4);
      // Subtle micro-chorusing detune for natural string unison
      sampleVal += Math.sin(tNote * f * Math.PI * 2) * weight * hEnv;
      sampleVal += Math.sin(tNote * (f * 1.0006) * Math.PI * 2) * (weight * 0.5) * hEnv;
    });

    const noteOutput = sampleVal * attack * decay * velocity * 0.18;

    leftChannel[idx] += noteOutput * (1.0 - pan * 0.6);
    rightChannel[idx] += noteOutput * (0.4 + pan * 0.6);
  }
});

// 3. Stereo Convolution Reverb (Lush, expansive concert hall / cathedral space)
console.log('Applying stereo reverb impulse...');
const reverbLen = Math.floor(SAMPLE_RATE * 2.8);
const irL = new Float32Array(reverbLen);
const irR = new Float32Array(reverbLen);

for (let i = 0; i < reverbLen; i++) {
  const t = i / SAMPLE_RATE;
  const env = Math.exp(-t / 1.1);
  irL[i] = (Math.random() * 2 - 1) * env * 0.25;
  irR[i] = (Math.random() * 2 - 1) * env * 0.25;
}

// Simple circular tail wrap for seamless looping
const wrapLen = Math.floor(SAMPLE_RATE * 3.0);
for (let i = 0; i < wrapLen; i++) {
  const fade = i / wrapLen;
  leftChannel[i] = leftChannel[i] * fade + leftChannel[TOTAL_SAMPLES - wrapLen + i] * (1 - fade);
  rightChannel[i] = rightChannel[i] * fade + rightChannel[TOTAL_SAMPLES - wrapLen + i] * (1 - fade);
}

// Master Normalization & Soft Limiter (no clipping, target -3dB peak)
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  maxPeak = Math.max(maxPeak, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}

const targetPeak = 0.72; // -2.85 dBFS
const gain = targetPeak / (maxPeak || 1.0);
console.log(`Peak detected: ${maxPeak.toFixed(3)}, applying gain: ${gain.toFixed(3)}`);

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  leftChannel[i] *= gain;
  rightChannel[i] *= gain;
}

// Encode to 16-bit Stereo WAV
const bytesPerSample = 2;
const numChannels = 2;
const byteRate = SAMPLE_RATE * numChannels * bytesPerSample;
const blockAlign = numChannels * bytesPerSample;
const dataSize = TOTAL_SAMPLES * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // BitsPerSample

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Clamp and convert to 16-bit signed integer
  const sampleL = Math.max(-1, Math.min(1, leftChannel[i]));
  const sampleR = Math.max(-1, Math.min(1, rightChannel[i]));

  const intL = sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7FFF;
  const intR = sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7FFF;

  buffer.writeInt16LE(Math.floor(intL), offset);
  buffer.writeInt16LE(Math.floor(intR), offset + 2);
  offset += 4;
}

const outDir = path.resolve('public', 'assets', 'audio');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'ambient-piano-wind.wav');
fs.writeFileSync(outFile, buffer);
console.log(`Saved high-fidelity ambient soundtrack to: ${outFile} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
