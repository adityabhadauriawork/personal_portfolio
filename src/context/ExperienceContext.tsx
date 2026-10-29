import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

export type VisualQuality = 'auto' | 'high' | 'reduced';

interface ExperienceContextType {
  // Loading lifecycle
  isLoading: boolean;
  isLoaded: boolean;
  loadingProgress: number;
  setLoadingProgress: (p: number) => void;
  finishLoading: () => void;

  // Sound settings
  isSoundActive: boolean;
  toggleSound: () => void;
  soundVolume: number;
  setSoundVolume: (v: number) => void;

  // Quality & Accessibility
  visualQuality: VisualQuality;
  setVisualQuality: (q: VisualQuality) => void;
  effectiveQuality: 'high' | 'reduced';
  reducedMotion: boolean;
  setReducedMotion: (rm: boolean) => void;

  // Global modals
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  activeNotification: string | null;
  showNotification: (msg: string) => void;
  hideNotification: () => void;
}

const ExperienceContext = createContext<ExperienceContextType | null>(null);

export const ExperienceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  const [visualQuality, setVisualQuality] = useState<VisualQuality>('auto');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Detect system reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute effective quality (auto adapts to screen DPR / mobile)
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.devicePixelRatio < 1.2);
  const effectiveQuality: 'high' | 'reduced' =
    visualQuality === 'reduced' ? 'reduced' : visualQuality === 'high' ? 'high' : isMobile ? 'reduced' : 'high';

  const toggleSound = useCallback(() => {
    setIsSoundActive((prev) => !prev);
  }, []);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(true);
  }, []);

  const showNotification = useCallback((msg: string) => {
    setActiveNotification(msg);
  }, []);

  const hideNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        isLoading,
        isLoaded,
        loadingProgress,
        setLoadingProgress,
        finishLoading,
        isSoundActive,
        toggleSound,
        soundVolume,
        setSoundVolume,
        visualQuality,
        setVisualQuality,
        effectiveQuality,
        reducedMotion,
        setReducedMotion,
        isSettingsOpen,
        setIsSettingsOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        activeNotification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = (): ExperienceContextType => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
