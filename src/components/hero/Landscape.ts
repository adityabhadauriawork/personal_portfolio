import * as THREE from 'three';
import { GlassFlowers } from './GlassFlowers';
import { WindPetals } from './WindPetals';
import { createWindGrass } from './WindGrass';
import { updateWind } from './wind';

export interface LandscapeConfig {
  reducedMotion: boolean;
  quality: 'high' | 'reduced';
}

/**
 * 3D Landscape Environment
 * Faithful to Emotion Agency Reference:
 * 1. Pastel lavender sky with gentle atmospheric haze.
 * 2. Asymmetric, irregular low-poly dark purple mountain silhouettes (natural jagged peaks).
 * 3. Rolling midground purple grass hill ridge between lake and mountains.
 * 4. Dark reflective lake with subtle calm ripples, mirrored mountain silhouettes & sculpture reflection.
 * 5. Translucent, iridescent 3D Glass Flowers framing corners & shoreline.
 * 6. Floating atmospheric rock debris and small iridescent pearl orb.
 */
export class LandscapeEnvironment {
  public group: THREE.Group;
  public glassFlowers: GlassFlowers;
  public petals: WindPetals;
  private skyMesh: THREE.Mesh;
  private mountainsGroup: THREE.Group;
  private midgroundHillMesh: THREE.Mesh;
  private shorelineGrassGroup: THREE.Group;
  private waterMesh: THREE.Mesh;
  private foregroundGrassGroup: THREE.Group;
  private floatingRocksMesh: THREE.InstancedMesh;
  private floatingRocksData: { basePos: THREE.Vector3; rotSpeed: THREE.Vector3; floatSpeed: number; floatAmp: number }[] = [];
  private pearlOrbMesh: THREE.Mesh;
  private motesPoints: THREE.Points;
  private motesMaterial: THREE.ShaderMaterial;
  private waterMaterial: THREE.ShaderMaterial;
  private skyMaterial: THREE.ShaderMaterial;
  private elapsed = 0; // total seconds elapsed, accumulated from injected delta

  constructor(config: LandscapeConfig) {
    this.group = new THREE.Group();

    // -------------------------------------------------------------------------
    // 1. Pastel Lavender Sky (Light & Airy Atmosphere)
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // 1. Pastel Lavender Sky — Panoramic Atmospheric Dome (Surrounding 360°)
    // -------------------------------------------------------------------------
    const skyGeo = new THREE.CylinderGeometry(110, 110, 85, 32, 1, true);
    const skyVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const skyFragmentShader = `
      uniform float uDarkMode;
      varying vec2 vUv;

      void main() {
        // Light mode: Pastel lavender sky (pearl horizon -> pale lavender -> soft violet upper)
        vec3 lightHorizon = vec3(0.965, 0.945, 0.985); // #F6F1FB
        vec3 lightMid     = vec3(0.880, 0.830, 0.960); // #DFD2F5
        vec3 lightUpper   = vec3(0.775, 0.695, 0.915); // #C4B0E8

        // Dark mode: Midnight plum & nocturnal orchid sky
        vec3 darkHorizon  = vec3(0.165, 0.085, 0.275); // #2A1646
        vec3 darkMid      = vec3(0.098, 0.051, 0.175); // #190D2D
        vec3 darkUpper    = vec3(0.055, 0.027, 0.102); // #0E071A

        vec3 colHorizon = mix(lightHorizon, darkHorizon, uDarkMode);
        vec3 colMid     = mix(lightMid, darkMid, uDarkMode);
        vec3 colUpper   = mix(lightUpper, darkUpper, uDarkMode);

        vec3 sky;
        if (vUv.y < 0.40) {
          sky = mix(colHorizon, colMid, vUv.y / 0.40);
        } else {
          sky = mix(colMid, colUpper, (vUv.y - 0.40) / 0.60);
        }

        // Soft horizontal atmospheric haze right above horizon
        float haze = exp(-pow((vUv.y - 0.22) * 5.5, 2.0)) * 0.16;
        vec3 hazeColor = mix(vec3(0.98, 0.95, 1.0), vec3(0.45, 0.22, 0.72), uDarkMode);
        sky += hazeColor * haze;

        gl_FragColor = vec4(sky, 1.0);
      }
    `;

    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDarkMode: { value: 0.0 },
      },
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.skyMesh.position.set(0, 18, 0);
    this.group.add(this.skyMesh);

    // -------------------------------------------------------------------------
    // 2. Distant Irregular Mountain Silhouettes (Low-Poly Rock Peaks)
    // -------------------------------------------------------------------------
    this.mountainsGroup = new THREE.Group();
    this.createMountainRanges();
    this.group.add(this.mountainsGroup);

    // -------------------------------------------------------------------------
    // 3. Rolling Midground Purple Grass Hill (Between Lake & Mountains)
    // -------------------------------------------------------------------------
    const hillGeo = new THREE.PlaneGeometry(110, 24, 64, 24);
    hillGeo.rotateX(-Math.PI * 0.48);
    const hillPos = hillGeo.attributes.position;
    for (let i = 0; i < hillPos.count; i++) {
      const x = hillPos.getX(i);
      const y = hillPos.getY(i);
      // Continuous organic rolling grass hill cresting behind the lake
      const broadWave = Math.sin(x * 0.08 - 0.4) * 1.2 + Math.cos(x * 0.16) * 0.5;
      const detail = Math.sin(x * 0.32 + y * 0.2) * 0.25;
      hillPos.setZ(i, (broadWave + detail) * 0.85 - 0.9);
    }
    hillGeo.computeVertexNormals();

    const hillMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#461A6B'), // Rich velvet purple grass
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true,
    });
    this.midgroundHillMesh = new THREE.Mesh(hillGeo, hillMat);
    this.midgroundHillMesh.position.set(0, -1.15, -22);
    this.group.add(this.midgroundHillMesh);

    // -------------------------------------------------------------------------
    // 4. Shoreline Grass Strip (Along the Lake Shore)
    // -------------------------------------------------------------------------
    this.shorelineGrassGroup = new THREE.Group();
    this.createShorelineGrass(config.quality);
    this.group.add(this.shorelineGrassGroup);

    // -------------------------------------------------------------------------
    // 5. Dark Reflective Lake with Mirrored Silhouettes & Sculpture Glow
    // -------------------------------------------------------------------------
    const waterGeo = new THREE.PlaneGeometry(160, 90, 64, 48);
    waterGeo.rotateX(-Math.PI * 0.5);

    const waterVertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;
      uniform float uMotionScale;

      void main() {
        vUv = uv;
        vec3 p = position;
        float t = uTime * 0.45 * uMotionScale;

        // Gentle, low-amplitude calm water swell (NO periodic horizontal lines)
        float wave1 = sin(p.x * 0.35 + t * 1.1 + p.z * 0.22) * 0.015;
        float wave2 = cos(p.z * 0.30 - t * 0.85 + p.x * 0.18) * 0.012;
        p.y += wave1 + wave2;

        vec4 worldPos = modelMatrix * vec4(p, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const waterFragmentShader = `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;
      uniform float uPulse;
      uniform vec3 uSculpturePos;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);

        // Organic 2D micro-ripples across pond surface (smooth, natural, NO periodic stripes)
        float t = uTime * 0.75;
        float r1 = sin(vWorldPos.x * 0.85 + vWorldPos.z * 0.65 + t) * 0.016;
        float r2 = cos(vWorldPos.x * 1.35 - vWorldPos.z * 1.15 - t * 0.8) * 0.012;
        float r3 = sin(vWorldPos.x * 2.1 + vWorldPos.z * 1.7 + t * 1.2) * 0.007;
        vec3 normal = normalize(vec3(r1 + r2, 1.0, (r1 - r3) * 0.65));

        float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.6);

        // Dark plum-purple water base (exact Emotion Agency reference)
        vec3 deepWater = vec3(0.11, 0.04, 0.17); // #1C0A2B Dark plum
        vec3 skyReflect = vec3(0.86, 0.79, 0.95); // #DCCAF2 Reflected lavender sky

        // Mirrored mountain silhouette & purple shoreline reflection
        float distToBank = smoothstep(-4.0, -22.0, vWorldPos.z);
        float bankWave = sin(vWorldPos.x * 0.12 - 0.4) * 0.28 + cos(vWorldPos.x * 0.22) * 0.14;
        float mountainReflMask = smoothstep(0.10 + bankWave, -0.6, vWorldPos.z + 13.5) * distToBank;
        vec3 mountainReflCol = vec3(0.24, 0.10, 0.35); // Inverted mountain & shoreline reflection

        // Luminous central sculpture reflection: vibrant violet, magenta, and pearl core
        float dx = vWorldPos.x - uSculpturePos.x;
        float dz = (vWorldPos.z + 10.5) * 0.35; // elongated reflection across water
        float scDist = sqrt(dx * dx * 1.6 + dz * dz);
        float scGlow = exp(-scDist * 0.75) * 0.65;
        vec3 scColor = mix(vec3(0.82, 0.35, 1.0), vec3(1.0, 0.85, 0.98), exp(-scDist * 1.8));

        vec3 waterColor = mix(deepWater, skyReflect, fresnel * 0.62 + 0.14);
        waterColor = mix(waterColor, mountainReflCol, mountainReflMask * 0.60);
        waterColor += scColor * scGlow * (1.0 + uPulse * 0.35);

        // Heartbeat radiant shimmer ring expanding on each pulse
        float pulseRing = exp(-pow((scDist - (0.8 + (1.0 - uPulse) * 2.8)) * 1.6, 2.0));
        waterColor += vec3(0.88, 0.60, 1.0) * pulseRing * uPulse * 0.25;

        // Delicate specular sheen catching twilight sky
        float calmGlint = pow(max(0.0, dot(normal, normalize(vec3(0.15, 0.95, 0.3)))), 32.0);
        waterColor += vec3(0.95, 0.88, 1.0) * calmGlint * 0.12;

        // Atmospheric edge feathering (blends seamlessly into fog)
        float edgeFade = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x) *
                         smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);

        gl_FragColor = vec4(waterColor, 0.88 * edgeFade);
      }
    `;

    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uMotionScale: { value: config.reducedMotion ? 0.25 : 1.0 },
        uSculpturePos: { value: new THREE.Vector3(0, 1.05, 0) },
      },
      transparent: true,
      depthWrite: false,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.position.set(0, -1.55, -11);
    this.group.add(this.waterMesh);

    // Drifting natural brown leaves (~3-8 visible at any time across desktop)
    this.petals = new WindPetals(config.quality === 'high' ? 8 : 4);
    this.group.add(this.petals.mesh);

    // -------------------------------------------------------------------------
    // 6. Translucent Glass Flowers Garden
    // -------------------------------------------------------------------------
    this.foregroundGrassGroup = new THREE.Group();
    this.glassFlowers = new GlassFlowers(config);
    this.group.add(this.glassFlowers.group);

    // -------------------------------------------------------------------------
    // 7. Atmospheric Floating Rock Fragments
    // -------------------------------------------------------------------------
    const rockCount = 15;
    const rockGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C123D'), // Dark twilight charcoal-purple
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true,
    });
    this.floatingRocksMesh = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);

    const dummy = new THREE.Object3D();
    for (let r = 0; r < rockCount; r++) {
      const x = -14 + (r / rockCount) * 28 + (Math.random() - 0.5) * 3.0;
      const y = 0.5 + Math.random() * 3.8;
      const z = -12 - Math.random() * 22;
      const scale = 0.6 + Math.random() * 1.2;

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();

      this.floatingRocksMesh.setMatrixAt(r, dummy.matrix);
      this.floatingRocksData.push({
        basePos: new THREE.Vector3(x, y, z),
        rotSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.2),
        floatSpeed: 0.4 + Math.random() * 0.5,
        floatAmp: 0.08 + Math.random() * 0.12,
      });
    }
    this.floatingRocksMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.floatingRocksMesh);

    // -------------------------------------------------------------------------
    // 8. Iridescent Floating Pearl Orb (Bottom Right)
    // -------------------------------------------------------------------------
    const orbGeo = new THREE.SphereGeometry(0.19, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#A855F7'),
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.85,
    });
    this.pearlOrbMesh = new THREE.Mesh(orbGeo, orbMat);
    this.pearlOrbMesh.position.set(2.4, -1.15, -1.8);
    this.group.add(this.pearlOrbMesh);

    // -------------------------------------------------------------------------
    // 9. Atmospheric Floating Luminous Motes
    // -------------------------------------------------------------------------
    const motesCount = config.quality === 'reduced' ? 120 : 240;
    const motesGeo = new THREE.BufferGeometry();
    const motesPos = new Float32Array(motesCount * 3);
    const motesSeed = new Float32Array(motesCount * 3);

    for (let i = 0; i < motesCount; i++) {
      const i3 = i * 3;
      motesPos[i3] = (Math.random() - 0.5) * 28;
      motesPos[i3 + 1] = -1.2 + Math.random() * 7.5;
      motesPos[i3 + 2] = -24 + Math.random() * 26;

      motesSeed[i3] = Math.random();
      motesSeed[i3 + 1] = Math.random();
      motesSeed[i3 + 2] = Math.random();
    }

    motesGeo.setAttribute('position', new THREE.BufferAttribute(motesPos, 3));
    motesGeo.setAttribute('aSeed', new THREE.BufferAttribute(motesSeed, 3));

    const motesVertexShader = `
      attribute vec3 aSeed;
      uniform float uTime;
      uniform float uMotionScale;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        float t = uTime * 0.22 * uMotionScale + aSeed.x * 40.0;

        p.y += sin(t + aSeed.y * 6.28) * 0.18;
        p.x += cos(t * 0.6 + aSeed.z * 6.28) * 0.14;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float pSize = (3.5 + aSeed.x * 4.5) * (80.0 / -mvPosition.z);
        gl_PointSize = clamp(pSize, 1.5, 7.5);

        vAlpha = 0.45 + sin(t * 1.1 + aSeed.y * 6.28) * 0.25;
      }
    `;

    const motesFragmentShader = `
      varying float vAlpha;
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float d = length(coord);
        if (d > 0.5) discard;
        float intensity = smoothstep(0.5, 0.05, d);
        vec3 color = vec3(0.96, 0.92, 1.0); // Soft pearl lavender
        gl_FragColor = vec4(color, intensity * vAlpha * 0.72);
      }
    `;

    this.motesMaterial = new THREE.ShaderMaterial({
      vertexShader: motesVertexShader,
      fragmentShader: motesFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMotionScale: { value: config.reducedMotion ? 0.25 : 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.motesPoints = new THREE.Points(motesGeo, this.motesMaterial);
    this.group.add(this.motesPoints);
  }

  /**
   * Realistic Stylized Mountain Environment
   * - Natural irregular ridgelines via domain-warped ridged multifractal terrain
   * - 4 layered depth ranges with varied slopes, asymmetric massif peaks, and cols
   * - Controlled faceting with directional light and purple-gray rock palette
   * - 360° surrounding ridges framing the lake and sky during orbital camera journey
   */
  private createMountainRanges() {
    const hash = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const vnoise = (x: number) => {
      const i = Math.floor(x);
      const f = x - i;
      const u = f * f * (3 - 2 * f);
      return hash(i) * (1 - u) + hash(i + 1) * u;
    };

    // Domain-warped ridged multifractal noise for realistic mountain topography
    const mountainRidge = (x: number, seed: number) => {
      let sum = 0;
      let amp = 1.0;
      let freq = 0.055;
      let norm = 0;
      // Domain warp
      const warp = vnoise(x * 0.04 + seed) * 3.5;
      const wx = x + warp;

      for (let o = 0; o < 5; o++) {
        const n = 1.0 - Math.abs(vnoise(wx * freq + seed * 1.7) * 2.0 - 1.0);
        sum += n * n * amp;
        norm += amp;
        amp *= 0.48;
        freq *= 2.12;
      }
      return sum / norm;
    };

    // 4 Distinct Depth Layers with low-poly faceted rock massifs
    const mountainLayers = [
      // Layer 1: Distant majestic horizon range
      { z: -52, height: 16.0, color: '#240E33', spread: 160, segments: 64, seed: 12.4, amp: 8.5, yBase: -0.4 },
      // Layer 2: Mid-distant crags and peaks (asymmetric left/right towers)
      { z: -43, height: 12.5, color: '#35154A', spread: 135, segments: 54, seed: 47.8, amp: 6.2, yBase: -0.6 },
      // Layer 3: Mid-near rocky shoulders and cols
      { z: -34, height: 9.0,  color: '#461C61', spread: 110, segments: 44, seed: 83.1, amp: 4.5, yBase: -0.8 },
      // Layer 4: Lake basin surrounding ridges (flanking and rear backdrop for 360° orbit)
      { z: 42,  height: 11.0, color: '#2B113D', spread: 140, segments: 48, seed: 129.5, amp: 5.5, yBase: -0.5 },
    ];

    mountainLayers.forEach((layer) => {
      const geo = new THREE.PlaneGeometry(layer.spread, layer.height, layer.segments, 8);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        if (y > -layer.height * 0.35) {
          const factor = (y + layer.height * 0.4) / (layer.height * 1.4);
          // Framing window in the center so the baby-pink heart stands out brilliantly
          const centerWindow = THREE.MathUtils.smoothstep(Math.abs(x), 2.5, 16.0);
          const mass = 0.40 + 0.60 * vnoise(x * 0.035 + layer.seed);
          const elevation = mountainRidge(x, layer.seed) * layer.amp * mass * (0.35 + 0.65 * centerWindow);

          pos.setY(i, y + elevation * factor);
          // Subtle 3D depth undulation along Z
          pos.setZ(i, (vnoise(x * 0.08 + layer.seed * 2.0) - 0.5) * 2.2 * factor);
        }
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(layer.color),
        roughness: 0.90,
        metalness: 0.08,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(geo, mat);
      // If behind camera, face toward center
      if (layer.z > 0) {
        mesh.rotation.y = Math.PI;
      }
      mesh.position.set(0, layer.yBase, layer.z);
      this.mountainsGroup.add(mesh);
    });

    // Sculpted faceted rock outcroppings (organic buttresses instead of primitive cones)
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3E1959'),
      roughness: 0.88,
      metalness: 0.10,
      flatShading: true,
    });

    const rockFormations = [
      { x: -30, z: -30, sx: 4.2, sy: 3.8, sz: 3.5, ry: 0.4 },
      { x: -20, z: -28, sx: 3.4, sy: 2.9, sz: 2.8, ry: 1.1 },
      { x: -12, z: -31, sx: 2.4, sy: 1.8, sz: 2.2, ry: 2.2 },
      { x: 14,  z: -29, sx: 2.6, sy: 2.2, sz: 2.4, ry: 1.8 },
      { x: 24,  z: -27, sx: 3.8, sy: 3.4, sz: 3.2, ry: 2.9 },
      { x: 32,  z: -31, sx: 4.6, sy: 4.0, sz: 3.8, ry: 0.7 },
      // Flanking framing rocks for 360° views
      { x: -35, z: 12,  sx: 3.8, sy: 3.2, sz: 3.2, ry: 1.5 },
      { x: 36,  z: 14,  sx: 4.0, sy: 3.5, sz: 3.4, ry: 2.4 },
    ];

    rockFormations.forEach((spec, idx) => {
      // Dodecahedron / icosahedron low-poly rock geometry for faceted, natural boulders
      const geo = new THREE.DodecahedronGeometry(1.0, 1);
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const vx = p.getX(v);
        const vy = p.getY(v);
        const vz = p.getZ(v);
        const deform = 0.80 + hash(v * 3.7 + idx * 9.1) * 0.40;
        // Asymmetric rock peak shaping (tapering upwards)
        const taperY = vy > 0 ? (1.0 + vy * 0.35) : 0.9;
        p.setXYZ(v, vx * deform, vy * taperY * 1.3, vz * deform);
      }
      geo.computeVertexNormals();

      const rock = new THREE.Mesh(geo, rockMat);
      rock.scale.set(spec.sx, spec.sy, spec.sz);
      rock.rotation.set(0.06 * idx, spec.ry, 0.04 * idx);
      rock.position.set(spec.x, -1.35 + spec.sy * 0.45, spec.z);
      this.mountainsGroup.add(rock);
    });
  }

  /**
   * Wind-driven curved purple grass: undulating shoreline behind the lake,
   * plus foreground clumps framing the lower corners (clear in the centre for the headline).
   */
  private createShorelineGrass(quality: 'high' | 'reduced') {
    const hi = quality === 'high';
    const fog = { color: new THREE.Color(0xE8DCF8), density: 0.014 };

    // Behind the lake: continuous, gently undulating bank
    this.shorelineGrassGroup.add(
      createWindGrass(
        {
          count: hi ? 2600 : 1200,
          place: (u, rand) => {
            const x = -42 + u * 84 + (rand() - 0.5) * 0.4;
            return { x, z: -21 + Math.sin(x * 0.11) * 1.4 + (rand() - 0.5) * 2.4 };
          },
          y: -1.55,
          height: [0.35, 0.95],
          width: 0.075,
          lean: 0.3,
          stiffness: 1.0,
        },
        fog
      )
    );

    // Foreground clumps tucked into the lower corners to frame without obstructing
    const clump = (side: -1 | 1) =>
      createWindGrass(
        {
          count: hi ? 380 : 180,
          place: (_u, rand) => {
            const r = Math.pow(rand(), 0.7);
            return { x: side * (2.8 + r * 3.2), z: -0.9 - rand() * 2.2 };
          },
          y: -1.52,
          height: [0.25, 0.65],
          width: 0.08,
          lean: 0.35,
          stiffness: 1.25,
        },
        fog
      );
    this.shorelineGrassGroup.add(clump(-1), clump(1));
  }

  private motionScale = 1;

  public setReducedMotion(reduced: boolean) {
    const scale = reduced ? 0.25 : 1.0;
    this.motionScale = reduced ? 0.3 : 1.0;
    this.waterMaterial.uniforms.uMotionScale.value = scale;
    this.motesMaterial.uniforms.uMotionScale.value = scale;
    if (this.glassFlowers) {
      this.glassFlowers.setReducedMotion(reduced);
    }
  }

  public update(heartbeatPulse: number = 0.0, delta: number = 0.016) {
    const dt = Math.min(Math.max(delta, 0.001), 0.033);
    this.elapsed += dt;
    const elapsedTime = this.elapsed;
    this.waterMaterial.uniforms.uTime.value = elapsedTime;
    this.waterMaterial.uniforms.uPulse.value = heartbeatPulse;
    this.motesMaterial.uniforms.uTime.value = elapsedTime;

    // ONE shared wind field drives grass, flower stems/petals and airborne petals
    updateWind(elapsedTime, dt, this.motionScale);
    this.petals.update();

    // Update 3D Glass Flowers Garden with synchronized heartbeat pulse
    if (this.glassFlowers) {
      this.glassFlowers.update(heartbeatPulse, dt);
    }

    // Subtle drift and slow tumble for floating rock debris
    if (this.floatingRocksMesh && this.floatingRocksData.length > 0) {
      const dummy = new THREE.Object3D();
      for (let r = 0; r < this.floatingRocksData.length; r++) {
        const d = this.floatingRocksData[r];
        const yOffset = Math.sin(elapsedTime * d.floatSpeed + r) * d.floatAmp;
        dummy.position.set(d.basePos.x, d.basePos.y + yOffset, d.basePos.z);
        dummy.rotation.set(
          elapsedTime * d.rotSpeed.x,
          elapsedTime * d.rotSpeed.y,
          elapsedTime * d.rotSpeed.z
        );
        dummy.updateMatrix();
        this.floatingRocksMesh.setMatrixAt(r, dummy.matrix);
      }
      this.floatingRocksMesh.instanceMatrix.needsUpdate = true;
    }

    // Subtle breathing pulse for pearl orb
    if (this.pearlOrbMesh) {
      this.pearlOrbMesh.position.y = -1.15 + Math.sin(elapsedTime * 1.4) * 0.035;
    }
  }

  public setDarkMode(isDark: boolean) {
    if (this.skyMaterial && this.skyMaterial.uniforms.uDarkMode) {
      this.skyMaterial.uniforms.uDarkMode.value = isDark ? 1.0 : 0.0;
    }
  }

  public setScrollProgress(progress: number) {
    // 1. Foreground glass flowers gracefully recede as user scrolls past hero
    if (this.glassFlowers) {
      const flowerDrop = Math.min(progress / 0.18, 1.0) * 3.2;
      this.glassFlowers.group.position.y = -flowerDrop;
      this.glassFlowers.setOpacity(1.0 - Math.max(0, (progress - 0.14) * 4.5));
    }

    if (this.foregroundGrassGroup) {
      const grassDrop = Math.min(progress / 0.18, 1.0) * 2.8;
      this.foregroundGrassGroup.position.y = -grassDrop;
    }

    // 2. Midground hill subtle depth parallax
    if (this.midgroundHillMesh) {
      this.midgroundHillMesh.position.y = -1.15 - progress * 1.2;
    }

    // 3. Floating rocks subtly drift with spatial depth
    if (this.floatingRocksMesh) {
      this.floatingRocksMesh.position.y = progress * 2.2;
    }

    // 4. Distant mountains slow parallax
    if (this.mountainsGroup) {
      this.mountainsGroup.position.y = -progress * 0.7;
    }

    // 5. Pearl orb orbital motion
    if (this.pearlOrbMesh) {
      this.pearlOrbMesh.position.x = 2.4 + Math.sin(progress * Math.PI) * 1.5;
    }
  }

  public dispose() {
    if (this.glassFlowers) {
      this.glassFlowers.dispose();
    }

    this.petals.dispose();
    this.skyMesh.geometry.dispose();
    this.skyMaterial.dispose();

    this.mountainsGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.midgroundHillMesh.geometry.dispose();
    (this.midgroundHillMesh.material as THREE.Material).dispose();

    this.shorelineGrassGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });

    this.waterMesh.geometry.dispose();
    this.waterMaterial.dispose();

    this.foregroundGrassGroup.traverse((obj) => {
      if (obj instanceof THREE.InstancedMesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });

    this.floatingRocksMesh.geometry.dispose();
    (this.floatingRocksMesh.material as THREE.Material).dispose();

    this.pearlOrbMesh.geometry.dispose();
    (this.pearlOrbMesh.material as THREE.Material).dispose();

    this.motesPoints.geometry.dispose();
    this.motesMaterial.dispose();
  }
}
