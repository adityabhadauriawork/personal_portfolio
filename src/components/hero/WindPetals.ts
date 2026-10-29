import * as THREE from 'three';
import { WIND_GLSL, windUniforms, windState } from './wind';

/**
 * Natural Wind-Advected Leaves
 * Faithful to Emotion Agency reference:
 * - Natural brown, warm taupe, muted burgundy, and subdued plum leaf colors.
 * - Organic tapered leaf outline with central vein crease.
 * - Subtle variation in size, curvature, and gentle tumble.
 * - Drastically reduced density: ~3 to 8 leaves visible at any one time across the desktop scene.
 * - Synchronized with the shared wind field controlling grass and vegetation.
 * - Fully pre-allocated, zero runtime garbage-collection churn.
 */
export class WindPetals {
  public mesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;
  private uAccum = { value: new THREE.Vector2() };

  constructor(count: number = 12) {
    // -------------------------------------------------------------------------
    // 1. Organic Curved 3D Leaf Geometry with Central Vein Fold
    // -------------------------------------------------------------------------
    const leafGeo = new THREE.BufferGeometry();
    const rows = 6;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const baseWidth = 0.08;
    const baseLength = 0.16;

    for (let r = 0; r <= rows; r++) {
      const v = r / rows; // 0 (stem) to 1 (tip)
      const y = (v - 0.5) * baseLength;
      
      // Lanceolate/ovate leaf profile
      const widthFactor = Math.sin(v * Math.PI) * (1.0 - 0.22 * v);
      const halfW = baseWidth * widthFactor * 0.5;

      // Longitudinal arch (leaf tip curves slightly)
      const archZ = Math.sin(v * Math.PI) * 0.04 - v * 0.02;

      // Transverse V-crease along midrib vein:
      // Left edge, center vein, right edge
      vertices.push(-halfW, y, archZ + 0.025); // Left
      uvs.push(0.0, v);

      vertices.push(0.0, y, archZ);             // Center vein (creased)
      uvs.push(0.5, v);

      vertices.push(halfW, y, archZ + 0.025);  // Right
      uvs.push(1.0, v);

      if (r < rows) {
        const i0 = r * 3;
        const i1 = (r + 1) * 3;
        // Left quad
        indices.push(i0, i1, i0 + 1);
        indices.push(i1, i1 + 1, i0 + 1);
        // Right quad
        indices.push(i0 + 1, i1 + 1, i0 + 2);
        indices.push(i1 + 1, i1 + 2, i0 + 2);
      }
    }

    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    leafGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    leafGeo.setIndex(indices);
    leafGeo.computeVertexNormals();

    // -------------------------------------------------------------------------
    // 2. Instanced Per-Leaf Attributes: Spatially Distributed & Pooled
    // -------------------------------------------------------------------------
    const seeds = new Float32Array(count * 4); // [x0, y0, z0, hueIndex]
    const rnd = new Float32Array(count * 4);   // [sizeScale, tumbleSpeed, windFactor, flutterPhase]

    for (let i = 0; i < count; i++) {
      const i4 = i * 4;
      // Staggered spatial coordinates across wind track
      seeds[i4] = (i / count) + (Math.random() - 0.5) * 0.25;
      seeds[i4 + 1] = 0.15 + Math.random() * 0.75;
      seeds[i4 + 2] = Math.random();
      seeds[i4 + 3] = Math.random(); // Hue selector

      rnd[i4] = 0.75 + Math.random() * 0.55;    // Size scale
      rnd[i4 + 1] = 0.25 + Math.random() * 0.45; // Gentle, restrained tumble
      rnd[i4 + 2] = 0.65 + Math.random() * 0.35; // Wind response
      rnd[i4 + 3] = Math.random() * Math.PI * 2;
    }

    leafGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    leafGeo.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 4));

    // -------------------------------------------------------------------------
    // 3. Leaf Shader: Coherent Wind Advection & Natural Earthy Palette
    // -------------------------------------------------------------------------
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        ...windUniforms,
        uAccum: this.uAccum,
        uOpacity: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        ${WIND_GLSL}
        uniform vec2 uAccum;
        attribute vec4 aSeed;
        attribute vec4 aRnd;

        varying vec2 vUv;
        varying float vHue;
        varying float vFade;
        varying float vShade;

        mat3 rot(vec3 axis, float a) {
          float s = sin(a), c = cos(a), t = 1.0 - c;
          return mat3(
            t*axis.x*axis.x + c,        t*axis.x*axis.y + s*axis.z, t*axis.x*axis.z - s*axis.y,
            t*axis.x*axis.y - s*axis.z, t*axis.y*axis.y + c,        t*axis.y*axis.z + s*axis.x,
            t*axis.x*axis.z + s*axis.y, t*axis.y*axis.z - s*axis.x, t*axis.z*axis.z + c);
        }

        void main() {
          vUv = uv;
          vHue = aSeed.w;

          // Bounding volume for graceful wrap-around
          // x: -12..12, y: -1.2..3.0, z: -16..4
          vec3 box = vec3(24.0, 4.2, 20.0);
          vec3 base = vec3(aSeed.x, aSeed.y, aSeed.z) * box;

          // Advected by shared wind accumulator (slow, believable travel)
          vec3 adv = vec3(uAccum.x * 0.65, 0.0, uAccum.y * 0.45) * aRnd.z;

          float t = uWindTime * 0.45;
          vec3 p = base + adv;

          // Slow descent and natural aerodynamic glide
          p.y -= t * 0.09 * aRnd.x;
          p.x += sin(t * 0.6 + aRnd.w) * 0.22;
          p.z += cos(t * 0.5 + aRnd.w) * 0.18;
          p.y += sin(t * 0.9 + aSeed.y * 12.0) * 0.08 + uWindGust * 0.4 * sin(t * 1.5 + aSeed.z * 6.0);

          p = mod(p, box);
          vec3 worldPos = p - vec3(12.0, 1.2, 10.0);

          // Edge boundary opacity fade (prevents pop-in)
          vFade = smoothstep(0.0, 2.0, p.x) * smoothstep(0.0, 2.0, box.x - p.x)
                * smoothstep(0.0, 0.8, p.y) * smoothstep(0.0, 0.8, box.y - p.y)
                * smoothstep(0.0, 1.5, p.z) * smoothstep(0.0, 1.5, box.z - p.z);

          // Gentle, realistic aerodynamic rotation (not aggressive confetti spin)
          float spin = t * aRnd.y * 1.2 + aSeed.x * 20.0;
          vec3 axis = normalize(vec3(0.3 + sin(aSeed.y * 15.0) * 0.4, 0.8, 0.3 + cos(aSeed.z * 11.0) * 0.3));
          vec3 local = position * aRnd.x * 0.95;
          vec3 rotated = rot(axis, spin) * local;

          vShade = 0.72 + 0.28 * abs(dot(normalize(rotated + vec3(0.0, 1.0, 0.5)), vec3(0.2, 0.9, 0.4)));

          vec4 mvPosition = viewMatrix * vec4(worldPos + rotated, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vHue;
        varying float vFade;
        varying float vShade;

        void main() {
          // Natural autumn leaf palette:
          // Earthy warm brown, rustic taupe, subdued plum, muted burgundy
          vec3 brownWarm  = vec3(0.42, 0.26, 0.16); // #6B4229
          vec3 taupeEarth = vec3(0.50, 0.34, 0.24); // #80573D
          vec3 mutedPlum  = vec3(0.38, 0.20, 0.28); // #613347
          vec3 deepBurgundy = vec3(0.32, 0.15, 0.20); // #522633

          vec3 baseCol;
          if (vHue < 0.33) {
            baseCol = mix(brownWarm, taupeEarth, vHue / 0.33);
          } else if (vHue < 0.66) {
            baseCol = mix(taupeEarth, mutedPlum, (vHue - 0.33) / 0.33);
          } else {
            baseCol = mix(mutedPlum, deepBurgundy, (vHue - 0.66) / 0.34);
          }

          // Visible central midrib vein (subtly darker along center uv.x = 0.5)
          float midrib = 1.0 - smoothstep(0.0, 0.05, abs(vUv.x - 0.5));
          baseCol *= (1.0 - midrib * 0.22);

          // Subtle natural edge gradient
          float edge = abs(vUv.x - 0.5) * 2.0;
          baseCol = mix(baseCol, baseCol * 1.15, edge * 0.3);

          baseCol *= vShade;

          float alpha = vFade * 0.92 * uOpacity;
          gl_FragColor = vec4(baseCol, alpha);
        }
      `,
    });

    this.mesh = new THREE.InstancedMesh(leafGeo, this.material, count);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
  }

  public update() {
    this.uAccum.value.set(windState.accumX, windState.accumZ);
  }

  public setOpacity(v: number) {
    this.material.uniforms.uOpacity.value = v;
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
