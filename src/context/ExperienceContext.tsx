import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { audioConfig } from '../data/audioConfig';

export type VisualQuality = 'auto' | 'high' | 'reduced';
export type ThemeMode = 'light' | 'dark';

interface ExperienceContextType {
  // Loading lifecycle
  isLoading: boolean;
  isLoaded: boolean;
  loadingProgress: number;
  setLoadingProgress: (p: number) => void;
  finishLoading: () => void;

  // Theme settings
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  // Sound settings
  isSoundActive: boolean;
  toggleSound: () => void;
  soundVolume: number;
  setSoundVolume: (v: number) => void;

  // Welcome modal
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
  dismissWelcomeModal: (withMusic: boolean) => void;

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

  // Theme state: default to 'light', restore saved preference if exists
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  // Sound active state: muted by default
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(audioConfig.defaultVolume);

  // Welcome modal: open once per browsing session
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const choice = sessionStorage.getItem('portfolio_welcome_choice');
      return choice === null;
    }
    return false;
  });

  const [visualQuality, setVisualQuality] = useState<VisualQuality>('auto');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Synchronize data-theme attribute on documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const showNotification = useCallback((msg: string) => {
    setActiveNotification(msg);
  }, []);

  const hideNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const toggleSound = useCallback(() => {
    if (!isSoundActive) {
      if (audioConfig.isSoundtrackUploaded) {
        setIsSoundActive(true);
      } else {
        showNotification('The custom soundtrack is currently being prepared. Enjoying quiet exploration.');
      }
    } else {
      setIsSoundActive(false);
    }
  }, [isSoundActive, showNotification]);

  const dismissWelcomeModal = useCallback(
    (withMusic: boolean) => {
      setIsWelcomeModalOpen(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('portfolio_welcome_choice', withMusic ? 'music' : 'silence');
      }

      if (withMusic) {
        if (audioConfig.isSoundtrackUploaded) {
          setIsSoundActive(true);
        } else {
          setIsSoundActive(false);
          showNotification('The custom soundtrack is currently being prepared. Continuing in quiet exploration.');
        }
      } else {
        setIsSoundActive(false);
      }
    },
    [showNotification]
  );

  // Compute effective quality (auto adapts to screen DPR / mobile)
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.devicePixelRatio < 1.2);
  const effectiveQuality: 'high' | 'reduced' =
    visualQuality === 'reduced' ? 'reduced' : visualQuality === 'high' ? 'high' : isMobile ? 'reduced' : 'high';

  const finishLoading = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(true);
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        isLoading,
        isLoaded,
        loadingProgress,
        setLoadingProgress,
        finishLoading,
        theme,
        setTheme,
        toggleTheme,
        isSoundActive,
        toggleSound,
        soundVolume,
        setSoundVolume,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        dismissWelcomeModal,
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
