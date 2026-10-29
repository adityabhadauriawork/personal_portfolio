import * as THREE from 'three';
import { WIND_GLSL, windUniforms } from './wind';

export interface GlassFlowersConfig {
  reducedMotion: boolean;
  quality: 'high' | 'reduced';
}

/**
 * 3D Glass Flowers Garden
 * Replaces the black spike-like vegetation with stylized, realistic,
 * translucent glass flowers inspired by Emotion Agency's surreal twilight aesthetic.
 *
 * Visual Characteristics:
 * - Clear translucent petals with iridescent lilac, violet, orchid, pink, pearl-white, and cyan highlights.
 * - Fresnel edge highlights, soft light transmission, and specular sheen.
 * - Slender organic stems and natural variation in flower size, orientation, and petal curvature.
 * - Rich floral foreground framing lower corners, clusters along the shoreline, and midground blooms.
 * - Gentle swaying in the twilight breeze and subtle glow synchronization with the heartbeat sculpture.
 */
export class GlassFlowers {
  public group: THREE.Group;
  private flowerMaterials: THREE.ShaderMaterial[] = [];
  private stemMaterials: THREE.MeshStandardMaterial[] = [];
  private elapsed = 0; // accumulated from delta injected each frame
  private quality: 'high' | 'reduced';
  private reducedMotion: boolean;

  constructor(config: GlassFlowersConfig) {
    this.group = new THREE.Group();
    this.quality = config.quality;
    this.reducedMotion = config.reducedMotion;

    this.buildGarden();

    // Each flower samples the shared wind field at its own world position
    this.group.children.forEach((child) => {
      const mat = child.userData.petalMat as THREE.ShaderMaterial | undefined;
      if (mat) mat.uniforms.uFlowerAnchor.value.copy(child.position);
    });
  }

  /**
   * Generates an organic, curved 3D petal geometry with subtle convex curvature
   */
  private createPetalGeometry(width: number, length: number, curve: number): THREE.BufferGeometry {
    const segmentsU = 10;
    const segmentsV = 16;
    const geo = new THREE.PlaneGeometry(width, length, segmentsU, segmentsV);
    const pos = geo.attributes.position;

    // Center pivot at base of petal
    geo.translate(0, length * 0.5, 0);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const v = y / length; // 0 (base) to 1 (tip)

      // Natural petal shape: narrow base, wide middle, tapering soft tip
      const widthFactor = Math.sin(v * Math.PI) * (1.0 - 0.25 * v);
      pos.setX(i, x * widthFactor);

      // Curve petal outward/backward organically (strictly non-negative for Math.pow)
      const nonNegV = Math.max(0.0, Math.min(1.0, v));
      const zCurve = -Math.pow(nonNegV, 1.8) * curve + Math.sin(x * 4.0) * 0.02;
      pos.setZ(i, zCurve);
    }

    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Custom glass shader with Fresnel edge sheen, chromatic iridescence, and heartbeat response
   */
  private createGlassPetalMaterial(baseColorHex: string, highlightHex: string): THREE.ShaderMaterial {
    const baseColor = new THREE.Color(baseColorHex);
    const highlightColor = new THREE.Color(highlightHex);

    const vertexShader = `
      ${WIND_GLSL}
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      uniform float uMotionScale;
      uniform float uStiff;
      uniform vec3 uFlowerAnchor;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec4 worldPos = modelMatrix * vec4(position, 1.0);

        // 1) whole head is carried by the stem tip (same wind field as the stem shader)
        vec2 tip = windDisp(uFlowerAnchor.xz, 1.0, uStiff);
        // 2) subtle extra petal-tip flutter, driven by the same wind (no independent spin)
        vec2 flutter = windDisp(worldPos.xz + 0.7, uv.y * uv.y, uStiff * 0.35);
        worldPos.xz += tip + flutter;

        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      uniform vec3 uBaseColor;
      uniform vec3 uHighlightColor;
      uniform vec3 uSculpturePos;
      uniform float uHeartbeatPulse;
      uniform float uGlobalOpacity;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);

        // Two-sided normal handling for thin translucent glass petals
        if (!gl_FrontFacing) normal = -normal;

        // Fresnel calculation: brilliant edge highlights like optical glass
        float NdotV = max(dot(normal, viewDir), 0.0);
        float fresnel = pow(1.0 - NdotV, 2.6);

        // Sculpture core light contribution
        vec3 toSculpture = uSculpturePos - vWorldPosition;
        float distToSculpture = length(toSculpture);
        vec3 lightDir = normalize(toSculpture);
        float sculpDiff = max(dot(normal, lightDir), 0.0) / (1.0 + distToSculpture * 0.35);

        // Specular highlight from twilight sky & directional light
        vec3 halfVec = normalize(viewDir + vec3(0.3, 0.8, 0.5));
        float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);

        // Iridescent color gradient across petal length (pearl base -> violet/orchid -> luminous edge)
        vec3 pearlWhite = vec3(0.97, 0.95, 1.0);
        vec3 cyanTint = vec3(0.72, 0.88, 0.98);

        vec3 petalBody = mix(uBaseColor, uHighlightColor, vUv.y * 0.85);
        petalBody = mix(petalBody, cyanTint, fresnel * 0.45);

        // Add specular and sculpture radiance
        vec3 finalCol = petalBody + pearlWhite * (fresnel * 0.65 + spec * 0.55);
        finalCol += vec3(0.85, 0.45, 1.0) * (sculpDiff * 0.45 + uHeartbeatPulse * 0.28);

        // Translucent glass opacity: clear body, glowing reflective rims
        float alpha = mix(0.48, 0.92, fresnel) * uGlobalOpacity;

        gl_FragColor = vec4(finalCol, alpha);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...windUniforms,
        uTime: { value: 0 },
        uMotionScale: { value: this.reducedMotion ? 0.2 : 1.0 },
        uStiff: { value: 0.9 + Math.random() * 0.5 },
        uFlowerAnchor: { value: new THREE.Vector3(0, 0, 0) },
        uBaseColor: { value: baseColor },
        uHighlightColor: { value: highlightColor },
        uSculpturePos: { value: new THREE.Vector3(0, 0.82, 0) },
        uHeartbeatPulse: { value: 0.0 },
        uGlobalOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });

    this.flowerMaterials.push(mat);
    return mat;
  }

  /**
   * Constructs a single multi-petaled glass blossom with stem and stamen
   */
  private createSingleFlower(options: {
    petalCount: number;
    petalWidth: number;
    petalLength: number;
    petalCurve: number;
    scale: number;
    stemHeight: number;
    stemCurve: number;
    baseColor: string;
    highlightColor: string;
    swaySpeed: number;
  }): THREE.Group {
    const flowerGroup = new THREE.Group();
    const petalGeo = this.createPetalGeometry(options.petalWidth, options.petalLength, options.petalCurve);
    const petalMat = this.createGlassPetalMaterial(options.baseColor, options.highlightColor);

    // 1. Curved Translucent Stem
    const stemCurvePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(options.stemCurve * 0.4, options.stemHeight * 0.4, options.stemCurve * 0.2),
      new THREE.Vector3(options.stemCurve, options.stemHeight * 0.85, options.stemCurve * 0.5),
      new THREE.Vector3(options.stemCurve * 0.8, options.stemHeight, options.stemCurve * 0.4),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurvePath, 16, 0.016 * options.scale, 8, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6B3FA0'), // Luminous orchid-violet glass stem
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color('#2A0E4D'),
      emissiveIntensity: 0.6,
    });
    const stiff = (petalMat.uniforms.uStiff.value as number);
    const stemH = options.stemHeight;
    stemMat.onBeforeCompile = (shader) => {
      shader.uniforms.uWindTime = windUniforms.uWindTime;
      shader.uniforms.uWindDir = windUniforms.uWindDir;
      shader.uniforms.uWindBase = windUniforms.uWindBase;
      shader.uniforms.uWindGust = windUniforms.uWindGust;
      shader.uniforms.uWindMotion = windUniforms.uWindMotion;
      shader.uniforms.uStemStiff = { value: stiff };
      shader.uniforms.uStemH = { value: stemH };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${WIND_GLSL}\nuniform float uStemStiff;\nuniform float uStemH;`)
        .replace(
          '#include <project_vertex>',
          `vec4 mvPosition = vec4(transformed, 1.0);
           vec4 wPos = modelMatrix * mvPosition;
           float hb = clamp(position.y / uStemH, 0.0, 1.0);
           wPos.xz += windDisp(wPos.xz, hb * hb, uStemStiff);
           mvPosition = viewMatrix * wPos;
           gl_Position = projectionMatrix * mvPosition;`
        );
    };
    this.stemMaterials.push(stemMat);
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    flowerGroup.add(stemMesh);
    flowerGroup.userData.petalMat = petalMat;
    flowerGroup.userData.stemH = stemH;

    // Small organic leaves attached naturally to the curved stem
    const stemLeafGeo = this.createPetalGeometry(0.065 * options.scale, 0.17 * options.scale, 0.08);
    const leaf1 = new THREE.Mesh(stemLeafGeo, petalMat);
    leaf1.position.set(options.stemCurve * 0.35, options.stemHeight * 0.38, options.stemCurve * 0.18);
    leaf1.rotation.set(0.55, 1.25, -0.35);
    flowerGroup.add(leaf1);

    const leaf2 = new THREE.Mesh(stemLeafGeo, petalMat);
    leaf2.position.set(options.stemCurve * 0.68, options.stemHeight * 0.64, options.stemCurve * 0.34);
    leaf2.rotation.set(-0.48, -1.35, 0.42);
    flowerGroup.add(leaf2);

    // 2. Head of the Flower at top of stem
    const headGroup = new THREE.Group();
    headGroup.position.set(options.stemCurve * 0.8, options.stemHeight, options.stemCurve * 0.4);

    // Luminous glass center stamen / pearl bead
    const stamenGeo = new THREE.SphereGeometry(0.045 * options.scale, 16, 16);
    const stamenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#E879F9'),
      emissiveIntensity: 0.75,
      roughness: 0.15,
      metalness: 0.85,
    });
    const stamenMesh = new THREE.Mesh(stamenGeo, stamenMat);
    stamenMesh.position.set(0, 0.02, 0);
    headGroup.add(stamenMesh);

    // 3. Radial Glass Petals
    const angleStep = (Math.PI * 2) / options.petalCount;
    for (let p = 0; p < options.petalCount; p++) {
      const angle = p * angleStep + (Math.random() - 0.5) * 0.1;
      const petalMesh = new THREE.Mesh(petalGeo, petalMat);

      petalMesh.scale.set(options.scale, options.scale, options.scale);
      petalMesh.rotation.y = angle;
      // Tilt petal outward organically (35 to 48 degrees)
      petalMesh.rotation.x = THREE.MathUtils.degToRad(38 + (p % 2) * 8);
      petalMesh.rotation.z = (Math.random() - 0.5) * 0.08;

      headGroup.add(petalMesh);
    }

    flowerGroup.add(headGroup);
    return flowerGroup;
  }

  /**
   * Composes the full twilight glass garden across depth layers
   */
  private buildGarden() {
    // Color palettes for iridescent glass flowers:
    // Pearl white, orchid magenta, soft lilac, electric violet, delicate rose
    const flowerThemes = [
      { base: '#7C3AED', highlight: '#F472B6' }, // Violet -> Orchid Pink
      { base: '#A855F7', highlight: '#FDF4FF' }, // Lilac -> Pearl White
      { base: '#9333EA', highlight: '#C084FC' }, // Purple -> Soft Lavender
      { base: '#6366F1', highlight: '#E879F9' }, // Indigo -> Vivid Rose
      { base: '#C026D3', highlight: '#FDE047' }, // Fuchsia -> Warm Gold sheen
    ];

    // =========================================================================
    // LAYER 1: FOREGROUND HERO GLASS FLOWERS (Lower Left & Lower Right Corners ONLY)
    // Framed gracefully along the far screen edges to frame the scene without blocking text
    // =========================================================================

    // Lower-Left Cluster (Tucked into the far left corner)
    const leftClusterPositions = [
      { x: -3.8, y: -1.98, z: -1.8, scale: 0.85, height: 0.72, petals: 6, curve: 0.22, rot: 0.4 },
      { x: -4.3, y: -1.96, z: -2.2, scale: 0.95, height: 0.82, petals: 5, curve: -0.18, rot: -0.3 },
      { x: -3.4, y: -2.02, z: -1.6, scale: 0.70, height: 0.58, petals: 5, curve: 0.15, rot: 0.8 },
      { x: -4.8, y: -1.94, z: -2.5, scale: 1.05, height: 0.90, petals: 7, curve: 0.28, rot: 0.1 },
    ];

    leftClusterPositions.forEach((spec, idx) => {
      const theme = flowerThemes[idx % flowerThemes.length];
      const fl = this.createSingleFlower({
        petalCount: spec.petals,
        petalWidth: 0.13,
        petalLength: 0.32,
        petalCurve: 0.15,
        scale: spec.scale,
        stemHeight: spec.height,
        stemCurve: spec.curve,
        baseColor: theme.base,
        highlightColor: theme.highlight,
        swaySpeed: 1.0 + idx * 0.15,
      });

      fl.position.set(spec.x, spec.y, spec.z);
      fl.rotation.y = spec.rot;
      this.group.add(fl);
    });

    // Lower-Right Cluster (Tucked into the far right corner, around pearl orb)
    const rightClusterPositions = [
      { x: 3.6, y: -1.98, z: -1.8, scale: 0.85, height: 0.72, petals: 6, curve: -0.22, rot: -0.4 },
      { x: 4.2, y: -1.95, z: -2.2, scale: 0.95, height: 0.85, petals: 7, curve: 0.18, rot: 0.3 },
      { x: 3.2, y: -2.02, z: -1.6, scale: 0.68, height: 0.55, petals: 5, curve: -0.14, rot: -0.8 },
      { x: 4.6, y: -1.92, z: -2.6, scale: 1.00, height: 0.88, petals: 6, curve: -0.26, rot: -0.2 },
    ];

    rightClusterPositions.forEach((spec, idx) => {
      const theme = flowerThemes[(idx + 2) % flowerThemes.length];
      const fl = this.createSingleFlower({
        petalCount: spec.petals,
        petalWidth: 0.13,
        petalLength: 0.32,
        petalCurve: 0.15,
        scale: spec.scale,
        stemHeight: spec.height,
        stemCurve: spec.curve,
        baseColor: theme.base,
        highlightColor: theme.highlight,
        swaySpeed: 0.9 + idx * 0.18,
      });

      fl.position.set(spec.x, spec.y, spec.z);
      fl.rotation.y = spec.rot;
      this.group.add(fl);
    });

    // =========================================================================
    // LAYER 2: DISTANT SHORELINE FLANKS ONLY (Z = -14 to -24)
    // Placed strictly along far left (x < -9) and far right (x > +9).
    // The central lake zone (x: -9 to +9) is 100% CLEAR for reflections!
    // =========================================================================
    const flankCount = this.quality === 'reduced' ? 4 : 8;
    for (let m = 0; m < flankCount; m++) {
      const side = m % 2 === 0 ? -1 : 1;
      const x = side * (10.0 + (m / flankCount) * 16.0 + Math.random() * 2.0);
      const z = -14.0 - Math.random() * 8.0;
      const y = -1.60;
      const scale = 0.45 + Math.random() * 0.35;
      const height = 0.40 + Math.random() * 0.40;
      const theme = flowerThemes[m % flowerThemes.length];

      const fl = this.createSingleFlower({
        petalCount: 5,
        petalWidth: 0.11,
        petalLength: 0.28,
        petalCurve: 0.13,
        scale,
        stemHeight: height,
        stemCurve: (Math.random() - 0.5) * 0.25,
        baseColor: theme.base,
        highlightColor: theme.highlight,
        swaySpeed: 0.8 + Math.random() * 0.5,
      });

      fl.position.set(x, y, z);
      fl.rotation.y = Math.random() * Math.PI * 2;
      this.group.add(fl);
    }
  }

  /**
   * Synchronizes flowers with sculpture heartbeat and time progression
   */
  public update(heartbeatPulse: number = 0.0, delta: number = 0.016) {
    this.elapsed += Math.min(Math.max(delta, 0.001), 0.033);
    const elapsedTime = this.elapsed;

    for (let i = 0; i < this.flowerMaterials.length; i++) {
      const mat = this.flowerMaterials[i];
      mat.uniforms.uTime.value = elapsedTime;
      mat.uniforms.uHeartbeatPulse.value = heartbeatPulse;
    }
  }

  public setOpacity(val: number) {
    const clamped = Math.max(0.0, Math.min(1.0, val));
    for (let i = 0; i < this.flowerMaterials.length; i++) {
      this.flowerMaterials[i].uniforms.uGlobalOpacity.value = clamped;
    }
  }

  public setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
    const scale = reduced ? 0.2 : 1.0;
    for (let i = 0; i < this.flowerMaterials.length; i++) {
      this.flowerMaterials[i].uniforms.uMotionScale.value = scale;
    }
  }

  public dispose() {
    this.flowerMaterials.forEach((m) => m.dispose());
    this.stemMaterials.forEach((m) => m.dispose());
    this.group.clear();
  }
}
