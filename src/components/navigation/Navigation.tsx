import React, { useState } from 'react';
import { Settings, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import { SoundToggle } from './SoundToggle';
import { SettingsPopover } from './SettingsPopover';
import styles from './Navigation.module.css';

interface NavigationProps {
  currentRoute?: '/' | '/about';
  onNavigate?: (route: '/' | '/about', hash?: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute = '/',
  onNavigate,
}) => {
  const {
    isLoaded,
    theme,
    toggleTheme,
    isSettingsOpen,
    setIsSettingsOpen,
    isContactModalOpen: _isContactModalOpen,
    setIsContactModalOpen,
  } = useExperience();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopNavLinks = [
    { label: 'About', href: '#about' },
    { label: 'Approach', href: '#approach' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ];

  const allNavLinks = [
    { label: 'About', href: '#about' },
    { label: 'Approach', href: '#approach' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Education', href: '#education' },
    { label: 'Certificates', href: '#certificates' },
    { label: 'Activities', href: '#activities' },
    { label: 'Skills', href: '#skills' },
    { label: 'CV', href: '#cv' },
    { label: 'Contact', href: '#contact' },
  ];

  const resolveTarget = (href: string) => {
    if (href === '#work') return '#projects';
    if (href === '#philosophy') return '#approach';
    if (href === '#certifications') return '#certificates';
    return href;
  };

  const handleLinkClick = (e: React.MouseEvent, item: { label: string; href: string }) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const resolvedHref = resolveTarget(item.href);

    if (currentRoute === '/') {
      if (onNavigate) {
        onNavigate('/about', resolvedHref);
      }
    } else {
      const targetEl = document.querySelector(resolvedHref);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentRoute === '/about') {
      if (onNavigate) {
        onNavigate('/', '');
      } else {
        window.location.assign('/');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isDarkMode = theme === 'dark';

  return (
    <>
      <header
        className={`${styles.navWrapper} ${isDarkMode ? styles.modeDark : styles.modeLight} ${
          currentRoute === '/about' ? styles.onInnerPage : ''
        }`}
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <div className={styles.navContainer}>
          {/* Brand Logo & Back to 3D World button */}
          <div className={styles.brandGroup}>
            <a
              href="#"
              className={styles.brandLogo}
              onClick={handleLogoClick}
              aria-label="Aditya Pratap Singh Bhadauria Homepage"
              data-cursor="pointer"
            >
              <span className={styles.logoMark}>
                ADITYA
                <span className={styles.logoDot} />
              </span>
            </a>

            {currentRoute === '/about' && (
              <button
                className={styles.backToWorldButton}
                onClick={() => (onNavigate ? onNavigate('/', '') : window.location.assign('/'))}
                data-cursor="pointer"
                aria-label="Return to 3D World and Opening Experience"
              >
                <span>← 3D World</span>
              </button>
            )}
          </div>

          {/* Desktop Nav Links (Minimal, focused: ABOUT · WORK · CONTACT) */}
          <nav aria-label="Main Navigation">
            <ul className={styles.navLinks}>
              {desktopNavLinks.map((link) => (
                <li key={link.label} className={styles.navLinkItem}>
                  <a
                    href={link.href}
                    className={styles.navLink}
                    onClick={(e) => handleLinkClick(e, link)}
                    data-cursor="pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Controls & CTAs: Theme, Settings, Sound, Let's talk */}
          <div className={styles.navActions}>
            <button
              className={styles.settingsButton}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              data-cursor="pointer"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span className={styles.settingsLabel}>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
            </button>

            <button
              className={styles.settingsButton}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label="Open experience & quality settings"
              data-cursor="pointer"
            >
              <Settings size={14} />
              <span className={styles.settingsLabel}>SETTINGS</span>
            </button>

            <SoundToggle isDarkTheme={!isDarkMode} />

            <button
              className={styles.talkButton}
              onClick={() => setIsContactModalOpen(true)}
              data-cursor="pointer"
            >
              <span>Let's talk</span>
              <ArrowUpRight size={14} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              data-cursor="pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Navigation Drawer */}
      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.open : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav aria-label="Mobile Navigation">
          <ul className={styles.mobileNavList}>
            {allNavLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={(e) => handleLinkClick(e, link)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileDrawerFooter}>
          <button
            className={styles.mobileTalkButton}
            onClick={() => {
              setMobileMenuOpen(false);
              setIsContactModalOpen(true);
            }}
          >
            Let's talk
          </button>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SoundToggle isDarkTheme={!isDarkMode} />
          </div>
        </div>
      </div>

      {/* Settings Popover */}
      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
