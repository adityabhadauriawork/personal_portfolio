import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExperienceProvider, useExperience } from './context/ExperienceContext';
import { ExperienceLoader } from './components/loading/ExperienceLoader';
import { HeroScene } from './components/hero/HeroScene';
import { Navigation } from './components/navigation/Navigation';
import { HeroSection } from './components/hero/HeroSection';
import { Chapter02About } from './components/narrative/Chapter02_About';
import { Chapter03Philosophy } from './components/narrative/Chapter03_Philosophy';
import { Chapter04Projects } from './components/narrative/Chapter04_Projects';
import { Chapter05Experience } from './components/narrative/Chapter05_Experience';
import { Chapter06Education } from './components/narrative/Chapter06_Education';
import { Chapter06Achievements } from './components/narrative/Chapter06_Achievements';
import { Chapter07Certifications } from './components/narrative/Chapter07_Certifications';
import { Chapter08Activities } from './components/narrative/Chapter08_Activities';
import { Chapter09Skills } from './components/narrative/Chapter09_Skills';
import { Chapter10CV } from './components/narrative/Chapter10_CV';
import { Chapter11Contact } from './components/narrative/Chapter11_Contact';
import { ContactModal } from './components/modals/ContactModal';
import { WelcomeMusicModal } from './components/modals/WelcomeMusicModal';
import { ToastNotification } from './components/ui/ToastNotification';
import { CursorGlow } from './components/effects/CursorGlow';
import { useAmbientAudio } from './hooks/useAmbientAudio';
import { PortalTransition, type PortalPhase } from './components/effects/PortalTransition';
import { ArrowLeft, Compass } from 'lucide-react';

const PortfolioExperience: React.FC = () => {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const { isLoaded, reducedMotion } = useExperience();
  const [portal, setPortal] = useState<PortalPhase>('idle');
  const portalBusy = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  // Minimal route state: '/' for 360° Opening World, '/about' for Narrative Chapters
  const [currentRoute, setCurrentRoute] = useState<'/' | '/about'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/about')) {
      return '/about';
    }
    return '/';
  });

  // Browser Back / Forward button support
  useEffect(() => {
    const handlePopState = () => {
      const isAbout = window.location.pathname.startsWith('/about');
      setCurrentRoute(isAbout ? '/about' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Web Audio listener
  useAmbientAudio();

  const handleNavigate = useCallback((route: '/' | '/about', hash?: string) => {
    if (route === '/about') {
      window.history.pushState(null, '', '/about' + (hash || ''));
      setCurrentRoute('/about');
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (hash) {
        window.setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'auto' });
        }, 80);
      }
    } else {
      window.history.pushState(null, '', '/');
      setCurrentRoute('/');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  /** Route change wrapped in the circular iris: conceal -> swap underneath -> reveal. Works both ways. */
  const portalNavigate = useCallback(
    (route: '/' | '/about', hash?: string) => {
      if (portalBusy.current) return;
      portalBusy.current = true;
      setPortal('closing');
      const closeMs = reducedMotion ? 320 : 880;
      const openMs = reducedMotion ? 450 : 1050;
      timers.current.push(
        window.setTimeout(() => {
          handleNavigate(route, hash);
          setPortal('opening');
          timers.current.push(
            window.setTimeout(() => {
              setPortal('idle');
              portalBusy.current = false;
            }, openMs)
          );
        }, closeMs)
      );
    },
    [handleNavigate, reducedMotion]
  );

  const handleExploreWork = () => {
    if (currentRoute === '/') {
      portalNavigate('/about', '#projects');
    } else {
      const el = document.getElementById('projects') || document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDiscoverStory = () => {
    if (currentRoute === '/') {
      portalNavigate('/about');
    } else {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="portfolio-app" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 1. Cinematic Branded Loader with ADITYA wordmark */}
      <ExperienceLoader isSceneReady={isSceneReady} />

      {/* 2. Luminous Fluid Trail & Sparkle Cursor */}
      <CursorGlow />

      {/* 3. Single Persistent Three.js 3D World (Heartbeat sculpture, glass flowers, 360° orbit) */}
      <HeroScene onSceneReady={handleSceneReady} />

      {/* 4. Translucent Floating Navigation Bar */}
      <Navigation currentRoute={currentRoute} onNavigate={portalNavigate} />

      {/* Circular iris used for every Home <-> About change */}
      <PortalTransition phase={portal} />

      {/* 5. Main Narrative Content */}
      <main>
        {currentRoute === '/' ? (
          /* Chapter 01 — 360° Cinematic Opening Hero Journey */
          <HeroSection
            onExploreWork={handleExploreWork}
            onDiscoverStory={handleDiscoverStory}
            onNavigateToAbout={() => portalNavigate('/about')}
            transitionBusy={portal !== 'idle'}
          />
        ) : (
          /* Narrative Chapters (/about route) */
          isLoaded && (
            <div style={{ position: 'relative', zIndex: 10 }}>
              {/* Return to 3D World Header Bar */}
              <div
                style={{
                  padding: '7rem 2.5rem 1.5rem',
                  maxWidth: 'var(--container-max)',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-card)',
                  marginBottom: '1rem',
                }}
              >
                <button
                  onClick={() => portalNavigate('/')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '9999px',
                    background: 'var(--surface-card-elevated)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-plum-dark)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                  data-cursor="pointer"
                  aria-label="Return to 3D Opening Atmosphere"
                >
                  <ArrowLeft size={15} />
                  <span>Return to 3D World</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.74rem',
                    color: 'var(--text-plum-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  <Compass size={14} color="var(--accent-purple)" />
                  <span>Aditya Pratap Singh Bhadauria · Portfolio</span>
                </div>
              </div>

              {/* Chapter 02 — About (From Idea to System) */}
              <Chapter02About onExploreWork={handleExploreWork} />

              {/* Chapter 03 — Approach (Layered 3D Engineering Stack) */}
              <Chapter03Philosophy />

              {/* Chapter 04 — Projects (Selected Flagship Work & Case Studies) */}
              <Chapter04Projects />

              {/* Chapter 05 — Experience (Internships & Evidence Flip Cards) */}
              <Chapter05Experience />

              {/* Chapter 06 — Achievements (The Railway of Milestones) */}
              <Chapter06Achievements />

              {/* Chapter 07 — Education (Academic History & ID Cards) */}
              <Chapter06Education />

              {/* Chapter 08 — Certificates (Credential Archive) */}
              <Chapter07Certifications />

              {/* Chapter 08.5 / Activities (Technical Initiatives & Sprints) */}
              <Chapter08Activities />

              {/* Chapter 09 — Skills (Structured Systems Matrix) */}
              <Chapter09Skills />

              {/* Chapter 10 — CV (Request by Email) */}
              <Chapter10CV />

              {/* Chapter 11 — Contact (White 3D Cat & Destinations) */}
              <Chapter11Contact />
            </div>
          )
        )}
      </main>

      {/* Cinematic Welcome Music Choice Modal (once per session after initial load) */}
      {isLoaded && <WelcomeMusicModal />}

      {/* Fast Contact Modal Drawer */}
      <ContactModal />

      {/* Contextual Toast Notifications */}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <ExperienceProvider>
      <PortfolioExperience />
    </ExperienceProvider>
  );
}
