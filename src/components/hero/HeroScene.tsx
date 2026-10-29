import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useExperience } from '../../context/ExperienceContext';
import { ParticleSculpture } from './ParticleSculpture';
import { LandscapeEnvironment } from './Landscape';
import { pointerState } from '../../utils/pointerState';
import { scrollState } from '../../utils/scrollState';

interface HeroSceneProps {
  onSceneReady?: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { effectiveQuality, reducedMotion } = useExperience();
  const [webGLError, setWebGLError] = useState<string | null>(null);

  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    sculpture: ParticleSculpture;
    landscape: LandscapeEnvironment;
    sculptureLight: THREE.PointLight;
    reqId: number;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // NOTE: We intentionally skip the temporary "test canvas" pattern here.
    // Creating a throwaway WebGL context wastes one of the browser's limited
    // WebGL context slots (~16 total). Instead we attempt to create the real
    // renderer and handle failure inline — this avoids the
    // "Too many active WebGL contexts" warning that caused the white-screen bug.

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xE8DCF8, 0.014);

    // Camera setup - framed for 13-17% sculpture width and 32-38% sculpture height
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 150);
    camera.position.set(0, 0.35, 5.8);

    // Renderer setup with capped DPR for 60 FPS performance
    const dpr = effectiveQuality === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1.0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: effectiveQuality === 'high',
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebGLError('WebGL is not available in your browser.');
      if (onSceneReady) onSceneReady();
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0xF6F1FB, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------------------
    // WebGL context loss/restore handling.
    // The browser can silently kill the oldest WebGL context when too many are
    // active. Without these handlers the canvas goes black/white and stays
    // broken until the page is reloaded.
    //
    // IMPORTANT — context restoration with Three.js:
    // After the OS restores the WebGL context, Three.js's internal caches
    // (shader programs, VAOs, texture handles, uniform locations) still point
    // to the old, now-invalid GPU objects. Calling renderer.render() without
    // first flushing those caches causes GL_INVALID_OPERATION cascades.
    // renderer.resetState() + renderer.info.reset() tell Three.js to treat the
    // next render as if it were the very first one: it re-uploads all geometry
    // and re-compiles all shader programs on demand.
    //
    // NOTE: We do NOT call renderer.setSize() in handleContextRestored.
    // setSize() tries to resize internal FBO textures that are already flagged
    // as immutable by the newly restored context, producing:
    //   GL_INVALID_OPERATION: glTexStorage2D: Texture is immutable.
    // After resetState()+info.reset(), Three.js reallocates those textures
    // lazily on the first render — no manual setSize() call is needed unless
    // the viewport actually changed while the context was lost.
    // -------------------------------------------------------------------------
    let contextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault(); // required — without this the browser will NOT fire contextrestored
      contextLost = true;
    };
    const handleContextRestored = () => {
      // Flush Three.js's stale internal GL caches before the next render.
      // This forces re-compilation of all shaders and re-upload of all
      // geometry on the next renderer.render() call.
      renderer.resetState();
      renderer.info.reset();
      // Re-apply tone-mapping settings (stored in JS, not in GL state)
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Coherent Lighting
    const ambientLight = new THREE.AmbientLight(0xE8DCFB, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xF5EDFE, 0x3D1A56, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFF8FF, 1.15);
    dirLight.position.set(10, 20, 14);
    scene.add(dirLight);

    // Luminous baby-pink point light in sculpture core
    const sculptureLight = new THREE.PointLight(0xFFD6F5, 2.6, 12, 1.8);
    sculptureLight.position.set(0, 1.10, 0);
    scene.add(sculptureLight);

    // Construct Environment & Particle Sculpture
    const landscape = new LandscapeEnvironment({
      reducedMotion,
      quality: effectiveQuality,
    });
    scene.add(landscape.group);

    const particleCount = effectiveQuality === 'high' ? 6400 : 3600;
    const sculpture = new ParticleSculpture({
      particleCount,
      reducedMotion,
    });
    scene.add(sculpture.group);

    // Parallax & render state
    const currentCamPos = new THREE.Vector3(0, 0.40, 5.8);
    const targetCamPos = new THREE.Vector3(0, 0.40, 5.8);

    let frameCount = 0;
    let reqId = 0;
    // THREE.Timer replaces the deprecated THREE.Clock.
    // timer.connect(document) enables the Page Visibility API integration:
    // delta is automatically zeroed when the tab is hidden, preventing the
    // large delta spike on return from a long tab switch.
    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp: number) => {
      reqId = requestAnimationFrame(animate);

      // Pause when WebGL context is lost
      if (contextLost) return;

      // Update timer — this also handles document.hidden delta-zeroing
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
      const sp = scrollState.progress;

      // Choreographed Camera and Sculpture Targets driven by scroll narrative
      const isMobile = width < 768 || width < height;
      const camZBase = isMobile ? 7.2 : 5.8;

      let baseCamX = 0;
      let baseCamY = 0.40;
      let baseCamZ = camZBase;
      let lookX = 0;
      let lookY = 0.65;
      let sculptureTargetX = 0;
      let sculptureTargetY = 0;
      let sculptureTargetScale = isMobile ? 0.75 : 1.0;
      let sculptureTargetOpacity = 1.0;

      const hp = scrollState.heroProgress;
      const heroTrackEl = document.getElementById('hero-pinned-track');

      if (heroTrackEl) {
        // ---------------------------------------------------------------------
        // Continuous, Coherent 360° Orbital Cinematic Camera Tour
        // Smooth closed 3D orbit around the sculpture:
        // - theta progresses continuously from 0 to 2*PI
        // - zero sudden direction reversals
        // - heart is always framed beautifully with 3D volume visible
        // - typography in Beats 2 & 4 has dedicated clear space (zero overlap)
        // ---------------------------------------------------------------------
        const theta = hp * Math.PI * 2.0;

        baseCamX = Math.sin(theta) * (isMobile ? 1.6 : 2.8);
        baseCamZ = camZBase - 1.4 * Math.sin(hp * Math.PI);
        baseCamY = 0.40 + 0.85 * Math.sin(hp * Math.PI);

        lookX = Math.sin(theta) * 0.35;
        lookY = 0.65 + 0.15 * Math.sin(hp * Math.PI);

        // Sculpture framing: drifts smoothly to opposite side of typography
        // In Beat 2 (hp ~ 0.25), text is left -> sculpture drifts right (+0.95)
        // In Beat 4 (hp ~ 0.75), text is right -> sculpture drifts left (-0.95)
        // In Beats 1, 3, 5, text is centered/open -> sculpture is centered (0.0)
        sculptureTargetX = (isMobile ? 0.35 : 0.95) * Math.sin(theta);
        sculptureTargetY = 0.45 * Math.sin(hp * Math.PI);
        sculptureTargetScale = isMobile ? 0.75 : 1.0;
        sculptureTargetOpacity = 1.0;
      } else {
        // Subsequent Chapters 02–11 Narrative Camera Progression
        if (sp < 0.18) {
          const t = sp / 0.18;
          baseCamX = THREE.MathUtils.lerp(0, isMobile ? 0 : -0.4, t);
          baseCamY = THREE.MathUtils.lerp(0.40, 0.75, t);
          baseCamZ = THREE.MathUtils.lerp(camZBase, camZBase + 0.5, t);
          lookY = THREE.MathUtils.lerp(0.65, 0.70, t);
          sculptureTargetX = THREE.MathUtils.lerp(0, isMobile ? 0.3 : 0.85, t);
          sculptureTargetY = THREE.MathUtils.lerp(0, 0.25, t);
          sculptureTargetOpacity = THREE.MathUtils.lerp(1.0, 0.82, t);
        } else if (sp < 0.38) {
          const t = (sp - 0.18) / 0.20;
          baseCamX = THREE.MathUtils.lerp(isMobile ? 0 : -0.4, 0, t);
          baseCamY = THREE.MathUtils.lerp(0.75, 1.0, t);
          baseCamZ = THREE.MathUtils.lerp(camZBase + 0.5, camZBase + 0.7, t);
          lookY = THREE.MathUtils.lerp(0.70, 0.75, t);
          sculptureTargetX = THREE.MathUtils.lerp(isMobile ? 0.3 : 0.85, 0, t);
          sculptureTargetY = THREE.MathUtils.lerp(0.25, 0.45, t);
          sculptureTargetOpacity = THREE.MathUtils.lerp(0.82, 0.70, t);
        } else if (sp < 0.62) {
          const t = (sp - 0.38) / 0.24;
          baseCamX = THREE.MathUtils.lerp(0, isMobile ? 0 : 0.5, t);
          baseCamY = THREE.MathUtils.lerp(1.0, 0.7, t);
          baseCamZ = THREE.MathUtils.lerp(camZBase + 0.7, camZBase + 1.0, t);
          lookY = THREE.MathUtils.lerp(0.75, 0.60, t);
          sculptureTargetX = THREE.MathUtils.lerp(0, isMobile ? -0.3 : -1.2, t);
          sculptureTargetY = THREE.MathUtils.lerp(0.45, 0.1, t);
          sculptureTargetScale = THREE.MathUtils.lerp(isMobile ? 0.75 : 1.0, isMobile ? 0.65 : 0.78, t);
          sculptureTargetOpacity = THREE.MathUtils.lerp(0.70, 0.38, t);
        } else if (sp < 0.85) {
          const t = (sp - 0.62) / 0.23;
          baseCamX = THREE.MathUtils.lerp(isMobile ? 0 : 0.5, isMobile ? 0 : -0.3, t);
          baseCamY = THREE.MathUtils.lerp(0.7, 0.6, t);
          baseCamZ = THREE.MathUtils.lerp(camZBase + 1.0, camZBase + 0.4, t);
          lookY = THREE.MathUtils.lerp(0.60, 0.55, t);
          sculptureTargetX = THREE.MathUtils.lerp(isMobile ? -0.3 : -1.2, isMobile ? 0.3 : 0.7, t);
          sculptureTargetY = THREE.MathUtils.lerp(0.1, 0.15, t);
          sculptureTargetScale = THREE.MathUtils.lerp(isMobile ? 0.65 : 0.78, isMobile ? 0.72 : 0.88, t);
          sculptureTargetOpacity = THREE.MathUtils.lerp(0.38, 0.52, t);
        } else {
          const t = (sp - 0.85) / 0.15;
          baseCamX = THREE.MathUtils.lerp(isMobile ? 0 : -0.3, 0, t);
          baseCamY = THREE.MathUtils.lerp(0.6, 0.4, t);
          baseCamZ = THREE.MathUtils.lerp(camZBase + 0.4, camZBase - 0.2, t);
          lookY = THREE.MathUtils.lerp(0.55, 0.60, t);
          sculptureTargetX = THREE.MathUtils.lerp(isMobile ? 0.3 : 0.7, 0, t);
          sculptureTargetY = THREE.MathUtils.lerp(0.15, 0.0, t);
          sculptureTargetScale = THREE.MathUtils.lerp(isMobile ? 0.72 : 0.88, isMobile ? 0.75 : 1.0, t);
          sculptureTargetOpacity = THREE.MathUtils.lerp(0.52, 0.88, t);
        }
      }

      // Read pointer directly from zero-overhead pointerState
      const parallaxFactor = reducedMotion ? 0.04 : (isMobile ? 0.12 : 0.35);
      targetCamPos.x = baseCamX + pointerState.normalizedX * parallaxFactor;
      targetCamPos.y = baseCamY + pointerState.normalizedY * (parallaxFactor * 0.4);
      targetCamPos.z = baseCamZ;

      // Delta-time-correct critical exponential damping (60Hz, 120Hz, 144Hz frame-rate independent)
      const smoothRate = 14.0;
      const smoothAlpha = 1.0 - Math.exp(-smoothRate * delta);

      currentCamPos.lerp(targetCamPos, smoothAlpha);
      camera.position.copy(currentCamPos);
      camera.lookAt(lookX, lookY, 0);

      // Smoothly transform sculpture position, scale & opacity
      sculpture.group.position.x = THREE.MathUtils.lerp(sculpture.group.position.x, sculptureTargetX, smoothAlpha);
      sculpture.group.position.y = THREE.MathUtils.lerp(sculpture.group.position.y, sculptureTargetY, smoothAlpha);
      const curScale = sculpture.group.scale.x;
      const nextScale = THREE.MathUtils.lerp(curScale, sculptureTargetScale, smoothAlpha);
      sculpture.group.scale.set(nextScale, nextScale, nextScale);
      sculpture.setOpacity(sculptureTargetOpacity);

      // Multi-layer landscape scroll parallax
      landscape.setScrollProgress(heroTrackEl ? hp * 0.02 : sp);

      const isHome = Boolean(heroTrackEl);
      const isSculptureInView = isHome || window.scrollY < window.innerHeight * 0.85;

      // Pass pointer coordinates to sculpture via camera raycasting only when sculpture is in view
      if (isSculptureInView) {
        sculpture.updatePointerFromCamera(camera, pointerState.normalizedX, pointerState.normalizedY, delta, pointerState.inside);
        sculpture.setPointer(pointerState.normalizedX, pointerState.normalizedY);
        sculpture.update(delta);
      }

      // Synchronize Heartbeat Pulse with Point Light, Glass Flowers, Water & Subtle Stage Micro-shake
      const pulse = sculpture.getHeartbeatPulse();
      sculptureLight.intensity = 2.2 + pulse * 1.8;

      if (!reducedMotion && pulse > 0.04 && isSculptureInView) {
        // Restrained 1-2px impulse synchronized with the heartbeat pulse
        const microShake = pulse * 0.010;
        camera.position.x += Math.sin(timer.getElapsed() * 60.0) * microShake;
        camera.position.y += Math.cos(timer.getElapsed() * 48.0) * microShake * 0.5;
      }

      landscape.update(pulse, delta);

      // Only perform expensive WebGL rendering when scene is in view
      if (isHome || window.scrollY <= window.innerHeight * 1.1) {
        renderer.render(scene, camera);
      }

      frameCount++;
      if (frameCount === 2 && onSceneReady) {
        onSceneReady();
      }
    };

    reqId = requestAnimationFrame(animate);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      sculpture,
      landscape,
      sculptureLight,
      reqId,
      isVisible: true,
    };

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      timer.dispose(); // disconnects visibilitychange listener
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.reqId);
        sceneRef.current.renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        sceneRef.current.renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        sceneRef.current.sculpture.dispose();
        sceneRef.current.landscape.dispose();
        sceneRef.current.renderer.dispose();
        if (container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        sceneRef.current = null;
      }
    };
  }, [effectiveQuality, reducedMotion, onSceneReady]);

  // Reduced motion dynamic update
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.sculpture.setReducedMotion(reducedMotion);
      sceneRef.current.landscape.setReducedMotion(reducedMotion);
    }
  }, [reducedMotion]);

  if (webGLError) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(180deg, #F6F1FB 0%, #DFD2F5 60%, #4D246E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#241B30',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ maxWidth: '480px', background: 'rgba(255,255,255,0.88)', padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.8rem', color: '#552080' }}>
            Atmospheric Mode
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#68587E', lineHeight: '1.6' }}>
            {webGLError} Displaying stylized atmospheric environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  );
};
