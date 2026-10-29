import * as THREE from 'three';

/**
 * Shared wind field. ONE set of uniform objects is referenced by every
 * wind-driven material (grass, flower stems, petals, flying petals/leaves),
 * so all vegetation responds coherently to the same dominant direction & gusts.
 */
export const windConfig = {
  direction: new THREE.Vector2(1.0, 0.35).normalize(), // dominant wind (x, z)
  baseIntensity: 0.05,      // constant gentle breeze (world units at full bend)
  gustStrength: 0.26,       // extra lean during gusts
  gustSpeedA: 0.23,         // slow irregular gust timing (two incommensurate waves)
  gustSpeedB: 0.11,
  drift: 0.35,              // baseline drift speed for airborne petals
  gustDrift: 1.7,           // extra drift speed during gusts
};

export const windUniforms = {
  uWindTime: { value: 0 },
  uWindDir: { value: windConfig.direction },
  uWindBase: { value: windConfig.baseIntensity },
  uWindGust: { value: 0 },
  uWindMotion: { value: 1 },
};

export const windState = {
  gust: 0,          // 0..1 smoothed gust envelope
  accumX: 0,        // integrated wind displacement (airborne particles are advected by this)
  accumZ: 0,
};

/** Advance the wind once per frame (called by the single rendering loop). */
export function updateWind(time: number, delta: number, motionScale: number) {
  const dt = Math.min(delta, 0.1);
  const g =
    Math.sin(time * windConfig.gustSpeedA) * 0.6 +
    Math.sin(time * windConfig.gustSpeedB + 1.3) * 0.4;
  const target = THREE.MathUtils.smoothstep(g, 0.25, 0.95);
  // asymmetric smoothing: gusts build quickly, then recover gradually
  const k = target > windState.gust ? 1.8 : 0.7;
  windState.gust += (target - windState.gust) * Math.min(1, k * dt);

  const speed = windConfig.drift + windState.gust * windConfig.gustDrift;
  windState.accumX += windConfig.direction.x * speed * dt * motionScale;
  windState.accumZ += windConfig.direction.y * speed * dt * motionScale;

  windUniforms.uWindTime.value = time;
  windUniforms.uWindBase.value = windConfig.baseIntensity;
  windUniforms.uWindGust.value = windState.gust * windConfig.gustStrength;
  windUniforms.uWindMotion.value = motionScale;
}

/** GLSL declarations + windDisp(); inject at the top of any wind-driven vertex shader. */
export const WIND_GLSL = /* glsl */ `
  uniform float uWindTime;
  uniform vec2 uWindDir;
  uniform float uWindBase;
  uniform float uWindGust;
  uniform float uWindMotion;

  // World-space XZ displacement. 'bend' is 0 at the anchored base and grows toward the tip.
  vec2 windDisp(vec2 xz, float bend, float stiffness) {
    float along = dot(xz, uWindDir);
    float lateral = xz.x * uWindDir.y - xz.y * uWindDir.x;
    // gusts travel through the field as moving fronts, not a global sync
    float front = sin(along * 0.45 - uWindTime * 1.35) * 0.5 + 0.5;
    float breeze = 0.55 + 0.45 * (sin(along * 0.9 - uWindTime * 1.1 + lateral * 0.3) * 0.5 + 0.5);
    float turb = sin(xz.x * 2.3 + uWindTime * 1.7) * cos(xz.y * 1.9 - uWindTime * 1.4);
    float s = uWindBase * breeze + uWindGust * (0.35 + 0.65 * front);
    vec2 perp = vec2(-uWindDir.y, uWindDir.x);
    return (uWindDir * s + perp * turb * uWindBase * 0.45) * bend * stiffness * uWindMotion;
  }
`;
