import * as THREE from 'three';

export interface SculptureConfig {
  particleCount: number;
  reducedMotion: boolean;
}

/**
 * Procedural 3D Crystalline Diamond Heart Sculpture
 * High-Fidelity Visual & Motion Refinement:
 * 1. Crystalline Material: 3D faceted low-poly diamond / octahedral crystals with planar facets,
 *    sharp facet normals, specular pinpoint diamond glints, and translucent inner brilliance.
 *    NO round atom or bead spheres!
 * 2. Baby-Pink Luminous Palette:
 *    - Dominant Baby Pink (#FFD6F5), Soft Blush (#F8C5EE), and Pale Orchid (#E6A4F4)
 *    - Orchid-Magenta (#CC66FF) and Luminous Violet (#A66BFA) for depth and outer contours
 *    - Electric Purple (#9047FF) accents in deep rear layers
 *    - Pearl-White (#FFF8FF) specular facet glints
 * 3. Compact Size: Reduced by ~22-25% (width ~1.06, height ~1.20 units) floating gracefully
 *    above the horizon with generous negative space around headline and scenery.
 * 4. Living Kinetic Glitter:
 *    - Idle continuous 3D shimmer wave and gentle crystal facet rotation catching light
 *    - Directional cursor velocity transport carrying crystals along cursor path with sparkling wake
 *    - Physical spring-damper recovery (k=54, c=10.5, zeta=0.72) returning smoothly in ~0.5-0.65s
 * 5. Reflected counterpart beneath lake level and atmospheric stardust motes.
 */
export class ParticleSculpture {
  public group: THREE.Group;
  public crystalMesh: THREE.InstancedMesh;
  public reflectionMesh: THREE.InstancedMesh;
  public sparklePoints: THREE.Points;

  private crystalMaterial: THREE.ShaderMaterial;
  private reflectionMaterial: THREE.ShaderMaterial;
  private sparkleMaterial: THREE.ShaderMaterial;
  private sparkleGeometry: THREE.BufferGeometry;

  private elapsed = 0; // total seconds elapsed, accumulated from injected delta

  // Exact 3D raycasting and pointer tracking
  private raycaster = new THREE.Raycaster();
  private intersectPlane = new THREE.Plane();
  private tempVec3A = new THREE.Vector3();
  private tempVec3B = new THREE.Vector3();
  private worldHit = new THREE.Vector3();
  private localHit = new THREE.Vector3();
  private currentPointer3D = new THREE.Vector3(999, 999, 999);
  private targetPointer3D = new THREE.Vector3(999, 999, 999);
  private prevPointer3D = new THREE.Vector3(999, 999, 999);
  private pointerVel3D = new THREE.Vector3(0, 0, 0);
  private targetPointerVel3D = new THREE.Vector3(0, 0, 0);
  private isPointerActive = false;
  private pointerNormalized = new THREE.Vector2(0, 0);

  // Physics simulation buffers
  private count: number;
  private refCount: number;
  private positions: Float32Array;
  private originalPositions: Float32Array;
  private velocities: Float32Array;
  private wakes: Float32Array;

  // Instanced attribute buffers
  private instPosAttr: THREE.InstancedBufferAttribute;
  private instWakeAttr: THREE.InstancedBufferAttribute;
  private refPosAttr: THREE.InstancedBufferAttribute;
  private refPositions: Float32Array;

  constructor(config: SculptureConfig) {
    this.group = new THREE.Group();

    const count = Math.min(Math.max(config.particleCount, 5200), 7200);
    const refCount = Math.floor(count * 0.45);
    this.count = count;
    this.refCount = refCount;

    // Allocate simulation arrays
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const wakes = new Float32Array(count);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4); // [rotSpeed, phase, glintFreq, id]

    this.positions = positions;
    this.originalPositions = originalPositions;
    this.velocities = velocities;
    this.wakes = wakes;

    // Palette: Lighter, softer, luminous Baby-Pink palette
    const cBabyPink = new THREE.Color('#FFD6F5');
    const cBlushPink = new THREE.Color('#F8C5EE');
    const cPaleOrchid = new THREE.Color('#E6A4F4');
    const cOrchidMag = new THREE.Color('#CC66FF');
    const cLuminousViolet = new THREE.Color('#A66BFA');
    const cElectricPurple = new THREE.Color('#9047FF');
    const cPearlWhite = new THREE.Color('#FFF8FF');
    const tempColor = new THREE.Color();

    /**
     * Parametric 3D Cardioid Heart Geometry
     * Refined size (~22-25% smaller than original):
     * - Width: X in [-0.53, 0.53] (total width 1.06 world units)
     * - Height: Y from 0.48 (tapered point) to 1.70 (upper lobe peaks)
     * - Center: Y = 1.10 (well above shoreline and headline)
     * - Cleft at top: Y ≈ 1.38, dipping 0.32 units between rounded lobes.
     * - Thickness: Z in [-0.23, 0.23] with dense 3D interior filling.
     */
    const getHeart2D = (t: number): { x: number; y: number } => {
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      const cos2T = Math.cos(2 * t);
      const cos3T = Math.cos(3 * t);
      const cos4T = Math.cos(4 * t);

      const rawX = 16 * sinT * sinT * sinT; // [-16, 16]
      const rawY = 13 * cosT - 5 * cos2T - 2 * cos3T - cos4T; // [-17, 12.3]

      // Scale to world units (~22% smaller)
      const sx = 0.53 / 16.0;
      const sy = 0.60 / 14.65;
      const centeredY = rawY + 2.35;

      return {
        x: rawX * sx,
        y: centeredY * sy,
      };
    };

    const heartCenterY = 1.10;
    const coreCount = Math.floor(count * 0.74);
    const shellCount = Math.floor(count * 0.18);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      let x = 0;
      let y = 0;
      let z = 0;
      let radDist = 0;
      let isApexOrCleft = false;

      if (i < coreCount) {
        // Core Volumetric 3D Body (Densely populated)
        const t = (Math.random() - 0.5) * Math.PI * 2.0;
        const bnd = getHeart2D(t);
        radDist = Math.sqrt(Math.random());
        x = bnd.x * radDist;
        y = heartCenterY + bnd.y * radDist;

        // Volumetric thickness tapering toward edges & tip
        const taper = 0.72 + 0.28 * ((y - 0.48) / 1.22);
        const maxZ = 0.23 * Math.sqrt(Math.max(0.01, 1.0 - radDist * radDist)) * taper;
        const zAngle = Math.random() * Math.PI * 2.0;
        const zRad = Math.sqrt(Math.random());
        z = Math.sin(zAngle) * zRad * maxZ;

        // Gentle forward curvature of upper lobes
        if (y > heartCenterY) {
          z += 0.04 * Math.sin(((y - heartCenterY) / 0.60) * Math.PI);
        }

        isApexOrCleft = (y > 1.35 && Math.abs(x) < 0.14) || y > 1.62;
      } else if (i < coreCount + shellCount) {
        // Perimeter crystalline shell & lobe contours
        const t = (Math.random() - 0.5) * Math.PI * 2.0;
        const bnd = getHeart2D(t);
        radDist = 0.92 + Math.random() * 0.10;
        x = bnd.x * radDist;
        y = heartCenterY + bnd.y * radDist;

        const maxZ = 0.12 * Math.max(0.1, 1.0 - Math.abs(bnd.x) / 0.53);
        z = (Math.random() - 0.5) * 2.0 * maxZ;

        isApexOrCleft = (y > 1.34 && Math.abs(x) < 0.16) || y > 1.60;
      } else {
        // Atmospheric stardust crystal motes
        const t = (Math.random() - 0.5) * Math.PI * 2.0;
        const bnd = getHeart2D(t);
        radDist = 1.05 + Math.random() * 0.28;
        x = bnd.x * radDist + (Math.random() - 0.5) * 0.08;
        y = heartCenterY + bnd.y * radDist + (Math.random() - 0.5) * 0.08;
        z = (Math.random() - 0.5) * 0.22;
        isApexOrCleft = Math.random() < 0.25;
      }

      // Color distribution: Baby-Pink and Pale Orchid dominance
      // Front & Core: Baby Pink, Soft Blush, Pale Orchid
      // Outer rims & Depth: Orchid-Magenta and Luminous Violet
      // Cleft & Highlights: Pearl-White
      if (isApexOrCleft) {
        tempColor.copy(cBabyPink).lerp(cPearlWhite, 0.45 + Math.random() * 0.55);
        scales[i] = 0.85 + Math.random() * 0.35;
      } else if (radDist < 0.35) {
        tempColor.copy(cBabyPink).lerp(cBlushPink, Math.random() * 0.6);
        scales[i] = 0.80 + Math.random() * 0.30;
      } else if (radDist < 0.68) {
        tempColor.copy(cBlushPink).lerp(cPaleOrchid, (radDist - 0.35) / 0.33);
        scales[i] = 0.75 + Math.random() * 0.28;
      } else if (radDist < 0.96) {
        tempColor.copy(cPaleOrchid).lerp(cOrchidMag, (radDist - 0.68) / 0.28);
        scales[i] = 0.70 + Math.random() * 0.25;
      } else {
        tempColor.copy(cOrchidMag).lerp(cLuminousViolet, 0.5 + Math.random() * 0.5);
        scales[i] = 0.65 + Math.random() * 0.25;
      }

      // 6% pure pearl-white diamond glints
      if (Math.random() < 0.06) {
        tempColor.copy(cPearlWhite);
        scales[i] *= 1.25;
      }

      // Rear volume depth accent (subtle electric purple)
      if (z < -0.08 && Math.random() < 0.25) {
        tempColor.lerp(cElectricPurple, 0.35);
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      seeds[i4] = 0.4 + Math.random() * 1.2;     // Rotation speed
      seeds[i4 + 1] = Math.random() * Math.PI * 2; // Phase
      seeds[i4 + 2] = 1.0 + Math.random() * 3.0; // Glint frequency
      seeds[i4 + 3] = i;                          // ID
    }

    // -------------------------------------------------------------------------
    // 1. Faceted 3D Diamond / Octahedral Crystal Geometry
    // -------------------------------------------------------------------------
    // 6 vertices, 8 triangular planar facets with sharp face normals
    const crystalGeo = new THREE.BufferGeometry();
    const r = 0.016; // Delicate crystal size
    const h = 0.024; // Slight vertical elongation

    // 8 distinct triangles (24 vertices) with explicit planar facet normals
    const verts: number[] = [
      // Top 4 facets
      0, h, 0,    r, 0, 0,    0, 0, r,     // Face 0
      0, h, 0,    0, 0, r,   -r, 0, 0,     // Face 1
      0, h, 0,   -r, 0, 0,    0, 0, -r,    // Face 2
      0, h, 0,    0, 0, -r,   r, 0, 0,     // Face 3
      // Bottom 4 facets
      0, -h, 0,   0, 0, r,    r, 0, 0,     // Face 4
      0, -h, 0,  -r, 0, 0,    0, 0, r,     // Face 5
      0, -h, 0,   0, 0, -r,  -r, 0, 0,     // Face 6
      0, -h, 0,   r, 0, 0,    0, 0, -r,    // Face 7
    ];

    crystalGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    crystalGeo.computeVertexNormals(); // Computes flat planar normals per triangle!

    // Instanced attributes
    this.instPosAttr = new THREE.InstancedBufferAttribute(positions, 3);
    this.instWakeAttr = new THREE.InstancedBufferAttribute(wakes, 1);
    const origAttr = new THREE.InstancedBufferAttribute(originalPositions, 3);
    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
    const scaleAttr = new THREE.InstancedBufferAttribute(scales, 1);
    const seedAttr = new THREE.InstancedBufferAttribute(seeds, 4);

    crystalGeo.setAttribute('aInstancePos', this.instPosAttr);
    crystalGeo.setAttribute('aOriginal', origAttr);
    crystalGeo.setAttribute('aColor', colorAttr);
    crystalGeo.setAttribute('aScale', scaleAttr);
    crystalGeo.setAttribute('aSeed', seedAttr);
    crystalGeo.setAttribute('aWake', this.instWakeAttr);

    // -------------------------------------------------------------------------
    // 2. Crystalline Shading Material (Faceted Diamond Highlights & Inner Glow)
    // -------------------------------------------------------------------------
    const crystalVertexShader = `
      attribute vec3 aInstancePos;
      attribute vec3 aOriginal;
      attribute vec3 aColor;
      attribute float aScale;
      attribute vec4 aSeed;
      attribute float aWake;

      uniform float uTime;
      uniform float uMotionScale;

      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vWake;
      varying float vGlint;

      // Rodrigues rotation matrix
      mat3 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        return mat3(
          oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
        );
      }

      void main() {
        float t = uTime * 0.45 * uMotionScale;

        // 1. Kinetic Living Shimmer Wave: continuous 3D flow across heart surface
        float flow1 = sin(aOriginal.y * 5.0 + t * 2.2 + aSeed.y) * 0.007;
        float flow2 = cos(aOriginal.x * 5.0 + t * 1.8 + aSeed.z) * 0.006;
        float flow3 = sin(aOriginal.z * 6.0 + t * 2.0 + aSeed.x) * 0.005;
        vec3 displaced = aInstancePos + vec3(flow2, flow1, flow3) * uMotionScale;

        // 2. Synchronized 1.5s Heartbeat Pulse:
        float hCycle = fract(uTime / 1.5);
        vec3 heartCenter = vec3(0.0, 1.10, 0.0);
        vec3 radDir = normalize(aOriginal - heartCenter + vec3(0.0001));

        float hPulse = 0.0;
        if (hCycle < 0.14) {
          float f = hCycle / 0.14;
          displaced -= radDir * (sin(f * 3.14159) * 0.015 * uMotionScale);
        } else if (hCycle < 0.30) {
          float f = (hCycle - 0.14) / 0.16;
          hPulse = sin(f * 3.14159);
          displaced += radDir * (0.040 * hPulse * uMotionScale);
        } else if (hCycle < 0.44) {
          float f = (hCycle - 0.30) / 0.14;
          hPulse = sin(f * 3.14159) * 0.32;
          displaced += radDir * (0.014 * hPulse * uMotionScale);
        }

        // 3. Dynamic Crystal Facet Rotation (Tumble catching diamond specular glints)
        vec3 rotAxis = normalize(vec3(
          sin(aSeed.y + t * 0.5),
          cos(aSeed.z + t * 0.6),
          sin(aSeed.w + t * 0.7)
        ));
        float rotAngle = t * aSeed.x * 0.6 + aSeed.y + aWake * 3.2;
        mat3 rotMat = rotationMatrix(rotAxis, rotAngle);

        // Transform local diamond vertex and normal
        vec3 localPos = rotMat * (position * aScale * (1.0 + hPulse * 0.12 + aWake * 0.25));
        vec3 localNorm = normalize(rotMat * normal);

        vec3 worldPos = (modelMatrix * vec4(displaced + localPos, 1.0)).xyz;
        vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        vNormal = normalize(mat3(modelMatrix) * localNorm);
        vViewDir = normalize(-mvPosition.xyz);
        vWake = aWake;

        // Color boost during beat pulse and wake
        vec3 dynamicColor = aColor;
        if (hPulse > 0.01) {
          dynamicColor = mix(dynamicColor, vec3(1.0, 0.88, 0.98), hPulse * 0.45);
        }
        if (aWake > 0.01) {
          dynamicColor = mix(dynamicColor, vec3(1.0, 0.98, 1.0), aWake * 0.75);
        }
        vColor = dynamicColor;

        // Dynamic glint modulation
        vGlint = sin(t * aSeed.z * 4.0 + aSeed.y * 6.28) * 0.5 + 0.5;
      }
    `;

    const crystalFragmentShader = `
      uniform float uGlobalOpacity;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vWake;
      varying float vGlint;

      void main() {
        vec3 norm = normalize(vNormal);
        vec3 view = normalize(vViewDir);

        // Directional key light (upper-left, slightly front)
        vec3 lightDir = normalize(vec3(-0.45, 0.70, 0.55));
        float diffuse = clamp(dot(norm, lightDir), 0.0, 1.0);

        // Secondary soft fill light (lower-right lavender)
        vec3 fillDir = normalize(vec3(0.5, -0.4, 0.4));
        float fillLight = clamp(dot(norm, fillDir), 0.0, 1.0) * 0.35;

        // Sharp Pinpoint Diamond Specular Highlight
        vec3 halfVec = normalize(lightDir + view);
        float specAngle = clamp(dot(norm, halfVec), 0.0, 1.0);
        float specular = pow(specAngle, 32.0); // Crisp diamond glint

        // Faceted edge glint
        float edgeGlint = pow(1.0 - abs(dot(norm, view)), 3.0);

        // Luminous Baby-Pink Inner Core Glow
        vec3 innerGlow = vec3(1.0, 0.84, 0.96) * 0.28;

        // Composite faceted crystal color
        vec3 crystalCol = vColor * (0.65 + diffuse * 0.45 + fillLight);
        crystalCol += innerGlow;
        crystalCol += vec3(1.0, 0.97, 1.0) * (specular * (0.85 + vGlint * 0.35));
        crystalCol += vec3(1.0, 0.90, 0.98) * (edgeGlint * 0.25);

        if (vWake > 0.01) {
          crystalCol += vec3(0.35, 0.15, 0.38) * vWake;
        }

        gl_FragColor = vec4(crystalCol, uGlobalOpacity * 0.96);
      }
    `;

    this.crystalMaterial = new THREE.ShaderMaterial({
      vertexShader: crystalVertexShader,
      fragmentShader: crystalFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMotionScale: { value: config.reducedMotion ? 0.25 : 1.0 },
        uGlobalOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: true,
      blending: THREE.NormalBlending,
    });

    this.crystalMesh = new THREE.InstancedMesh(crystalGeo, this.crystalMaterial, count);
    this.crystalMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.crystalMesh);

    // -------------------------------------------------------------------------
    // 3. Lake Reflected Crystals (Beneath Water Level)
    // -------------------------------------------------------------------------
    const waterLevel = -1.55;
    const refPositions = new Float32Array(refCount * 3);
    const refColors = new Float32Array(refCount * 3);
    const refScales = new Float32Array(refCount);
    const refSeeds = new Float32Array(refCount * 4);
    this.refPositions = refPositions;

    for (let j = 0; j < refCount; j++) {
      const srcIdx = Math.floor(j * (count / refCount));
      const j3 = j * 3;
      const s3 = srcIdx * 3;

      refPositions[j3] = positions[s3];
      refPositions[j3 + 1] = waterLevel - (positions[s3 + 1] - waterLevel) * 0.88;
      refPositions[j3 + 2] = positions[s3 + 2];

      refColors[j3] = colors[s3];
      refColors[j3 + 1] = colors[s3 + 1];
      refColors[j3 + 2] = colors[s3 + 2];

      refScales[j] = scales[srcIdx] * 0.85;

      const s4 = srcIdx * 4;
      const j4 = j * 4;
      refSeeds[j4] = seeds[s4];
      refSeeds[j4 + 1] = seeds[s4 + 1];
      refSeeds[j4 + 2] = seeds[s4 + 2];
      refSeeds[j4 + 3] = seeds[s4 + 3];
    }

    const refGeo = crystalGeo.clone();
    this.refPosAttr = new THREE.InstancedBufferAttribute(refPositions, 3);
    refGeo.setAttribute('aInstancePos', this.refPosAttr);
    refGeo.setAttribute('aOriginal', new THREE.InstancedBufferAttribute(refPositions, 3));
    refGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(refColors, 3));
    refGeo.setAttribute('aScale', new THREE.InstancedBufferAttribute(refScales, 1));
    refGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(refSeeds, 4));
    refGeo.setAttribute('aWake', new THREE.InstancedBufferAttribute(new Float32Array(refCount), 1));

    const refFragmentShader = `
      uniform float uGlobalOpacity;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 col = mix(vColor, vec3(0.85, 0.65, 0.95), 0.25);
        gl_FragColor = vec4(col, uGlobalOpacity * 0.58);
      }
    `;

    this.reflectionMaterial = new THREE.ShaderMaterial({
      vertexShader: crystalVertexShader,
      fragmentShader: refFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMotionScale: { value: config.reducedMotion ? 0.25 : 1.0 },
        uGlobalOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.reflectionMesh = new THREE.InstancedMesh(refGeo, this.reflectionMaterial, refCount);
    this.group.add(this.reflectionMesh);

    // -------------------------------------------------------------------------
    // 4. Atmospheric Stardust Sparkle Motes
    // -------------------------------------------------------------------------
    const sparkleCount = config.reducedMotion ? 120 : 220;
    this.sparkleGeometry = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleOrigin = new Float32Array(sparkleCount * 3);
    const sparkleVel = new Float32Array(sparkleCount * 3);
    const sparkleColor = new Float32Array(sparkleCount * 3);
    const sparkleSeeds = new Float32Array(sparkleCount * 4);

    const sparklePalette = [
      new THREE.Color('#FFF8FF'),
      new THREE.Color('#FFD6F5'),
      new THREE.Color('#F8C5EE'),
      new THREE.Color('#E6A4F4'),
      new THREE.Color('#CC66FF'),
    ];

    for (let k = 0; k < sparkleCount; k++) {
      const k3 = k * 3;
      const k4 = k * 4;

      const srcIdx = Math.floor(Math.random() * count);
      const sx = positions[srcIdx * 3];
      const sy = positions[srcIdx * 3 + 1];
      const sz = positions[srcIdx * 3 + 2];

      sparkleOrigin[k3] = sx;
      sparkleOrigin[k3 + 1] = sy;
      sparkleOrigin[k3 + 2] = sz;

      sparklePos[k3] = sx;
      sparklePos[k3 + 1] = sy;
      sparklePos[k3 + 2] = sz;

      const center = new THREE.Vector3(0, heartCenterY, 0);
      const outDir = new THREE.Vector3(sx, sy, sz).sub(center).normalize();
      outDir.x += (Math.random() - 0.5) * 0.5;
      outDir.y += (Math.random() - 0.5) * 0.5 + 0.10;
      outDir.z += (Math.random() - 0.5) * 0.5;
      outDir.normalize();

      const speed = 0.40 + Math.random() * 0.65;
      sparkleVel[k3] = outDir.x * speed;
      sparkleVel[k3 + 1] = outDir.y * speed;
      sparkleVel[k3 + 2] = outDir.z * speed;

      const clr = sparklePalette[Math.floor(Math.random() * sparklePalette.length)];
      sparkleColor[k3] = clr.r;
      sparkleColor[k3 + 1] = clr.g;
      sparkleColor[k3 + 2] = clr.b;

      sparkleSeeds[k4] = Math.random() * 0.08;
      sparkleSeeds[k4 + 1] = 0.45 + Math.random() * 0.35;
      sparkleSeeds[k4 + 2] = 2.2 + Math.random() * 2.0;
      sparkleSeeds[k4 + 3] = (Math.random() - 0.5) * 2.5;
    }

    this.sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    this.sparkleGeometry.setAttribute('aOrigin', new THREE.BufferAttribute(sparkleOrigin, 3));
    this.sparkleGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(sparkleVel, 3));
    this.sparkleGeometry.setAttribute('aColor', new THREE.BufferAttribute(sparkleColor, 3));
    this.sparkleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(sparkleSeeds, 4));

    const sparkleVertexShader = `
      attribute vec3 aOrigin;
      attribute vec3 aVelocity;
      attribute vec3 aColor;
      attribute vec4 aSeed;

      uniform float uTime;
      uniform float uMotionScale;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;

        float period = 1.5;
        float burstStart = 0.18 * period;
        float tInCycle = mod(uTime - burstStart, period);

        float dt = tInCycle - aSeed.x;
        float lifetime = aSeed.y;

        if (dt > 0.0 && dt < lifetime) {
          float lifeProgress = dt / lifetime;
          float drag = 1.0 - lifeProgress * 0.45;
          vec3 p = aOrigin + aVelocity * dt * drag * uMotionScale;

          p.x += sin(dt * aSeed.w + aSeed.x * 10.0) * 0.03 * dt;
          p.z += cos(dt * aSeed.w + aSeed.x * 10.0) * 0.03 * dt;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          float shimmer = 0.8 + 0.25 * sin(dt * 30.0 + aSeed.x * 20.0);
          float size = aSeed.z * shimmer * (42.0 / -mvPosition.z) * (1.0 - lifeProgress * 0.6);
          gl_PointSize = clamp(size, 1.5, 6.5);

          float attack = smoothstep(0.0, 0.05, dt);
          float decay = (1.0 - lifeProgress) * (1.0 - lifeProgress);
          vAlpha = attack * decay * 0.90;
        } else {
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = 0.0;
          vAlpha = 0.0;
        }
      }
    `;

    const sparkleFragmentShader = `
      uniform float uGlobalOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // 4-pointed sparkle star shape
        float star = 1.0 - smoothstep(0.0, 0.5, dist);
        float crossH = 1.0 - smoothstep(0.0, 0.08, abs(coord.y)) * (1.0 - smoothstep(0.0, 0.5, abs(coord.x)));
        float crossV = 1.0 - smoothstep(0.0, 0.08, abs(coord.x)) * (1.0 - smoothstep(0.0, 0.5, abs(coord.y)));
        float flare = max(star, max(crossH * 0.8, crossV * 0.8));

        gl_FragColor = vec4(vColor, flare * vAlpha * uGlobalOpacity);
      }
    `;

    this.sparkleMaterial = new THREE.ShaderMaterial({
      vertexShader: sparkleVertexShader,
      fragmentShader: sparkleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMotionScale: { value: config.reducedMotion ? 0.25 : 1.0 },
        uGlobalOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.sparklePoints = new THREE.Points(this.sparkleGeometry, this.sparkleMaterial);
    this.group.add(this.sparklePoints);
  }

  /**
   * Raycasts from camera to the sculpture's world plane, calculating exact local 3D hit and velocity.
   */
  public updatePointerFromCamera(
    camera: THREE.Camera,
    ndcX: number,
    ndcY: number,
    delta: number,
    isInside: boolean = true
  ) {
    if (!isInside) {
      this.isPointerActive = false;
      this.targetPointerVel3D.set(0, 0, 0);
      this.pointerVel3D.set(0, 0, 0);
      this.prevPointer3D.set(999, 999, 999);
      return;
    }

    this.pointerNormalized.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointerNormalized, camera);

    const camDir = camera.getWorldDirection(this.tempVec3A);
    this.group.getWorldPosition(this.tempVec3B);
    this.tempVec3B.y += 1.10; // heart center
    this.intersectPlane.setFromNormalAndCoplanarPoint(camDir.negate(), this.tempVec3B);

    if (this.raycaster.ray.intersectPlane(this.intersectPlane, this.worldHit)) {
      this.group.worldToLocal(this.localHit.copy(this.worldHit));
      this.targetPointer3D.copy(this.localHit);

      if (this.prevPointer3D.x > 900) {
        this.prevPointer3D.copy(this.localHit);
      }

      const dt = Math.max(delta, 0.001);
      const vx = (this.localHit.x - this.prevPointer3D.x) / dt;
      const vy = (this.localHit.y - this.prevPointer3D.y) / dt;
      const vz = (this.localHit.z - this.prevPointer3D.z) / dt;

      this.targetPointerVel3D.set(vx, vy, vz);
      this.prevPointer3D.copy(this.localHit);
      this.isPointerActive = true;
    } else {
      this.isPointerActive = false;
      this.targetPointerVel3D.set(0, 0, 0);
    }
  }

  public setPointer(x: number, y: number) {
    this.pointerNormalized.set(x, y);
  }

  public setOpacity(val: number) {
    const clamped = Math.max(0.0, Math.min(1.0, val));
    this.crystalMaterial.uniforms.uGlobalOpacity.value = clamped;
    this.reflectionMaterial.uniforms.uGlobalOpacity.value = clamped;
    if (this.sparkleMaterial) {
      this.sparkleMaterial.uniforms.uGlobalOpacity.value = clamped;
    }
  }

  public setReducedMotion(reduced: boolean) {
    const scale = reduced ? 0.25 : 1.0;
    this.crystalMaterial.uniforms.uMotionScale.value = scale;
    this.reflectionMaterial.uniforms.uMotionScale.value = scale;
    if (this.sparkleMaterial) {
      this.sparkleMaterial.uniforms.uMotionScale.value = scale;
    }
  }

  public getHeartbeatPulse(): number {
    const elapsed = this.elapsed;
    const cycle = (elapsed % 1.5) / 1.5;
    if (cycle >= 0.14 && cycle < 0.30) {
      return Math.sin(((cycle - 0.14) / 0.16) * Math.PI);
    } else if (cycle >= 0.30 && cycle < 0.44) {
      return Math.sin(((cycle - 0.30) / 0.14) * Math.PI) * 0.32;
    }
    return 0.0;
  }

  /**
   * Main simulation tick:
   * Dynamic Spring-Damper Physics + Tangential Cursor Carrying Impulse
   * Tuned parameters:
   * - Natural frequency omega = 7.4 rad/s (k = 54.0)
   * - Damping constant c = 10.5 (zeta = 0.71 critical damping)
   * - Displaced crystals recover smoothly and naturally to heart shape in ~0.50-0.65s
   */
  public update(delta: number = 0.016) {
    const dt = Math.min(Math.max(delta, 0.001), 0.033);
    this.elapsed += dt; // accumulate elapsed seconds
    const elapsedTime = this.elapsed;
    const motionScale = this.crystalMaterial.uniforms.uMotionScale.value as number;

    // Pointer velocity smoothing
    if (this.isPointerActive) {
      this.currentPointer3D.lerp(this.targetPointer3D, 0.38);
      this.pointerVel3D.lerp(this.targetPointerVel3D, 0.35);
      this.targetPointerVel3D.multiplyScalar(0.70);
    } else {
      this.targetPointerVel3D.set(0, 0, 0);
      this.pointerVel3D.lerp(this.targetPointerVel3D, 0.25);
      this.currentPointer3D.set(999, 999, 999);
    }

    // 1. Directional velocity impulse + flowing wake
    const speed = this.pointerVel3D.length();
    if (this.isPointerActive && speed > 0.02 && motionScale > 0.1) {
      const px = this.currentPointer3D.x;
      const py = this.currentPointer3D.y;
      const pz = this.currentPointer3D.z;

      const normVx = this.pointerVel3D.x / speed;
      const normVy = this.pointerVel3D.y / speed;
      const normVz = this.pointerVel3D.z / speed;

      const radius = 0.52;
      const radiusSq = radius * radius;
      const impulseStrength = Math.min(speed * 0.40, 1.20) * motionScale;

      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;
        const dx = this.positions[i3] - px;
        const dy = this.positions[i3 + 1] - py;
        const dz = this.positions[i3 + 2] - pz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < radiusSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const falloff = 1.0 - dist / radius;
          const f2 = falloff * falloff;

          const invDist = 1.0 / dist;
          const swirlX = -(dy * invDist);
          const swirlY = dx * invDist;

          // Directional force along velocity vector + tangential wake
          const impulseX = (normVx * 0.78 + swirlX * 0.22) * impulseStrength * f2;
          const impulseY = (normVy * 0.78 + swirlY * 0.22) * impulseStrength * f2;
          const impulseZ = normVz * 0.40 * impulseStrength * f2;

          this.velocities[i3] += impulseX * 22.0 * dt;
          this.velocities[i3 + 1] += impulseY * 22.0 * dt;
          this.velocities[i3 + 2] += impulseZ * 22.0 * dt;

          this.wakes[i] = Math.max(this.wakes[i], f2 * Math.min(speed * 0.35, 1.0));
        }
      }
    }

    // 2. Physical Spring-Damper Recovery (2 sub-steps)
    const subSteps = 2;
    const subDt = dt / subSteps;
    const kBase = 54.0;
    const c = 10.5;

    for (let step = 0; step < subSteps; step++) {
      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;

        const dispX = this.positions[i3] - this.originalPositions[i3];
        const dispY = this.positions[i3 + 1] - this.originalPositions[i3 + 1];
        const dispZ = this.positions[i3 + 2] - this.originalPositions[i3 + 2];
        const dispSq = dispX * dispX + dispY * dispY + dispZ * dispZ;
        const dispLen = Math.sqrt(dispSq);

        // Gentle non-linear return boost
        const k = kBase * (1.0 + 0.8 * Math.min(dispLen, 1.0));

        const fx = -k * dispX - c * this.velocities[i3];
        const fy = -k * dispY - c * this.velocities[i3 + 1];
        const fz = -k * dispZ - c * this.velocities[i3 + 2];

        this.velocities[i3] += fx * subDt;
        this.velocities[i3 + 1] += fy * subDt;
        this.velocities[i3 + 2] += fz * subDt;

        // Velocity clamping
        const vSq =
          this.velocities[i3] * this.velocities[i3] +
          this.velocities[i3 + 1] * this.velocities[i3 + 1] +
          this.velocities[i3 + 2] * this.velocities[i3 + 2];
        if (vSq > 100.0) {
          const vScale = 10.0 / Math.sqrt(vSq);
          this.velocities[i3] *= vScale;
          this.velocities[i3 + 1] *= vScale;
          this.velocities[i3 + 2] *= vScale;
        }

        this.positions[i3] += this.velocities[i3] * subDt;
        this.positions[i3 + 1] += this.velocities[i3 + 1] * subDt;
        this.positions[i3 + 2] += this.velocities[i3 + 2] * subDt;

        // Safety displacement clamp (0.95 max)
        if (dispLen > 0.95) {
          const pull = 0.95 / dispLen;
          this.positions[i3] = this.originalPositions[i3] + dispX * pull;
          this.positions[i3 + 1] = this.originalPositions[i3 + 1] + dispY * pull;
          this.positions[i3 + 2] = this.originalPositions[i3 + 2] + dispZ * pull;
          this.velocities[i3] *= 0.5;
          this.velocities[i3 + 1] *= 0.5;
          this.velocities[i3 + 2] *= 0.5;
        }
      }
    }

    // Wake dissipation
    for (let i = 0; i < this.count; i++) {
      if (this.wakes[i] > 0.001) {
        this.wakes[i] = Math.max(0.0, this.wakes[i] - dt / 0.40);
      }
    }

    this.instPosAttr.needsUpdate = true;
    this.instWakeAttr.needsUpdate = true;

    // 3. Mirror reflection positions beneath lake
    const waterLevel = -1.55;
    for (let j = 0; j < this.refCount; j++) {
      const srcIdx = Math.floor(j * (this.count / this.refCount));
      const j3 = j * 3;
      const s3 = srcIdx * 3;
      this.refPositions[j3] = this.positions[s3];
      this.refPositions[j3 + 1] = waterLevel - (this.positions[s3 + 1] - waterLevel) * 0.88;
      this.refPositions[j3 + 2] = this.positions[s3 + 2];
    }
    this.refPosAttr.needsUpdate = true;

    // Shader uniforms
    this.crystalMaterial.uniforms.uTime.value = elapsedTime;
    this.reflectionMaterial.uniforms.uTime.value = elapsedTime;
    if (this.sparkleMaterial) {
      this.sparkleMaterial.uniforms.uTime.value = elapsedTime;
    }

    // Subtle parallax tilt
    const floatTime = elapsedTime * 0.45;
    const tiltY = Math.sin(floatTime * 0.7) * 0.02 + this.pointerNormalized.x * 0.04 * motionScale;
    const tiltX = Math.cos(floatTime * 0.5) * 0.015 - this.pointerNormalized.y * 0.03 * motionScale;
    const tiltZ = Math.sin(floatTime * 0.4) * 0.01;

    this.group.rotation.set(tiltX, tiltY, tiltZ);
  }

  public dispose() {
    this.crystalMesh.geometry.dispose();
    this.reflectionMesh.geometry.dispose();
    if (this.sparkleGeometry) this.sparkleGeometry.dispose();
    this.crystalMaterial.dispose();
    this.reflectionMaterial.dispose();
    if (this.sparkleMaterial) this.sparkleMaterial.dispose();
  }
}
