import * as THREE from 'three';
import { WIND_GLSL, windUniforms } from './wind';

export interface GrassPatch {
  count: number;
  /** returns x,z for blade i in [0,1) */
  place: (u: number, rand: () => number) => { x: number; z: number };
  y: number;
  height: [number, number];
  width: number;
  lean: number;
  stiffness: number;
}

/**
 * Wind-driven curved grass. Single InstancedMesh per patch, one shared ShaderMaterial.
 * Blade base is anchored (bend weight 0 at the root); upper blade is displaced by the shared wind field.
 * Colour runs from deep plum at the root to brighter violet at the tip (no black).
 */
export function createWindGrass(patch: GrassPatch, fog: { color: THREE.Color; density: number }) {
  const segments = 5;
  const verts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let s = 0; s <= segments; s++) {
    const v = s / segments;
    const halfW = (1.0 - Math.pow(v, 1.6) * 0.92) * patch.width * 0.5;
    const curve = v * v * 0.18; // static natural curvature
    verts.push(-halfW + curve, v, 0, halfW + curve, v, 0);
    uvs.push(0, v, 1, v);
    if (s < segments) {
      const a = s * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);

  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...windUniforms,
      uStiff: { value: patch.stiffness },
      uFogColor: { value: fog.color },
      uFogDensity: { value: fog.density },
      uTipColor: { value: new THREE.Color('#9B6BE8') },
      uRootColor: { value: new THREE.Color('#3A1660') },
    },
    vertexShader: /* glsl */ `
      ${WIND_GLSL}
      uniform float uStiff;
      attribute float aTone;
      varying float vV;
      varying float vTone;
      varying float vDepth;
      void main() {
        vV = uv.y;
        vTone = aTone;
        // instance matrix scales Y by blade height; position.y is 0..1
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        float bend = vV * vV;
        wp.xz += windDisp(wp.xz, bend, uStiff);
        // blades lower slightly when pushed so length is approximately preserved
        wp.y -= length(windDisp(wp.xz, bend, uStiff)) * 0.25 * bend;
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTipColor;
      uniform vec3 uRootColor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      varying float vV;
      varying float vTone;
      varying float vDepth;
      void main() {
        vec3 root = uRootColor * (0.85 + vTone * 0.5);
        vec3 tip = mix(uTipColor, vec3(0.86, 0.62, 0.98), vTone * 0.5);
        vec3 col = mix(root, tip, smoothstep(0.0, 1.0, vV));
        float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
        gl_FragColor = vec4(mix(col, uFogColor, clamp(f, 0.0, 1.0)), 1.0);
      }
    `,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, patch.count);
  const tones = new Float32Array(patch.count);
  const dummy = new THREE.Object3D();
  // deterministic PRNG so layout is stable between reloads
  let seed = 1337 + patch.count;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < patch.count; i++) {
    const { x, z } = patch.place(i / patch.count, rand);
    const h = patch.height[0] + rand() * (patch.height[1] - patch.height[0]);
    dummy.position.set(x, patch.y, z);
    dummy.rotation.set((rand() - 0.5) * 0.15, rand() * Math.PI * 2, (rand() - 0.5) * patch.lean);
    dummy.scale.set(0.8 + rand() * 0.6, h, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    tones[i] = rand();
  }
  geo.setAttribute('aTone', new THREE.InstancedBufferAttribute(tones, 1));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}
