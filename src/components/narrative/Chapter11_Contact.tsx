import React, { useState } from 'react';
import { Mail, ArrowUpRight, Copy, Check, Code, Compass, ArrowUp, Heart } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../ui/BrandIcons';
import { siteConfig } from '../../data/siteConfig';
import { BotanicalWindow } from './BotanicalWindow';
import { useExperience } from '../../context/ExperienceContext';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter11_Contact.module.css';

export const Chapter11Contact: React.FC = () => {
  const { showNotification } = useExperience();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(siteConfig.email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = siteConfig.email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showNotification('Email address copied to clipboard.');
      setTimeout(() => setCopied(false), 2400);
    } catch {
      showNotification(`Email: ${siteConfig.email}`);
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="contact" className={styles.section} aria-label="Contact and Social Coordinates">
      <div className={styles.container}>
        {/* Studio Composition: Botanical Window + Closing Folio Card */}
        <div className={styles.compositionGrid}>
          {/* Left Column: Architectural Animated Botanical Window */}
          <RevealBlock className={styles.flowerColumn} delayMs={100}>
            <BotanicalWindow assetPath="/assets/portfolio/flowers/contact-flower.gif" />
          </RevealBlock>

          {/* Right Column: Closing Narrative & Verified Destinations */}
          <RevealBlock className={styles.contentColumn} delayMs={180}>
            <div className={styles.coordinatesCard}>
              {/* Eyebrow */}
              <div className={styles.eyebrow}>
                <span className={styles.chapterNumber}>CONTACT / 11</span>
                <span className={styles.separator}>·</span>
                <span>GET IN TOUCH</span>
              </div>

              {/* Main Heading */}
              <RevealText tag="h2" className={styles.headline}>
                Thank you for exploring my work.
              </RevealText>

              {/* Supporting Message */}
              <p className={styles.supportingText}>
                Every meaningful project begins with a thoughtful conversation. Thank you for taking the time to explore my work and journey.
              </p>

              {/* Distinct Closing Line */}
              <div className={styles.closingLine}>
                “Let's build something meaningful.”
              </div>

              {/* Verified Destinations Header */}
              <div className={styles.destinationsLabel}>
                <span className={styles.destinationsDot} />
                <span>Verified Contact Destinations</span>
              </div>

              {/* The 4 Verified Profiles — Clean Zigzag Layout */}
              <div className={styles.linksList}>
                {/* 1. Email (Left) */}
                <div className={`${styles.linkTile} ${styles.tileLeft}`}>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className={styles.tileMainLink}
                    data-cursor="pointer"
                    aria-label={`Send email to ${siteConfig.email}`}
                  >
                    <div className={styles.tileIcon}>
                      <Mail size={18} />
                    </div>
                    <div className={styles.tileContent}>
                      <span className={styles.tileLabel}>Email</span>
                      <span className={styles.tileValue}>{siteConfig.email}</span>
                    </div>
                  </a>

                  <div className={styles.tileActions}>
                    <button
                      className={styles.copyInlineBtn}
                      onClick={handleCopyEmail}
                      data-cursor="pointer"
                      aria-label="Copy email address"
                      type="button"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className={styles.tileArrowLink}
                      data-cursor="pointer"
                      aria-label={`Send email to ${siteConfig.email}`}
                    >
                      <ArrowUpRight size={16} className={styles.tileArrow} />
                    </a>
                  </div>
                </div>

                {/* 2. LinkedIn (Right) */}
                <a
                  href={siteConfig.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.linkTile} ${styles.tileRight}`}
                  data-cursor="pointer"
                  aria-label="Visit Aditya's verified LinkedIn profile"
                >
                  <div className={styles.tileMainContent}>
                    <div className={styles.tileIcon}>
                      <LinkedinIcon size={18} />
                    </div>
                    <div className={styles.tileContent}>
                      <span className={styles.tileLabel}>LinkedIn</span>
                      <span className={styles.tileValue}>linkedin.com/in/aditya-pratap-singh-bhadauria</span>
                    </div>
                  </div>

                  <div className={styles.tileActions}>
                    <span className={styles.tileArrowWrap}>
                      <ArrowUpRight size={16} className={styles.tileArrow} />
                    </span>
                  </div>
                </a>

                {/* 3. GitHub (Left) */}
                <a
                  href={siteConfig.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.linkTile} ${styles.tileLeft}`}
                  data-cursor="pointer"
                  aria-label="Visit Aditya's verified GitHub profile"
                >
                  <div className={styles.tileMainContent}>
                    <div className={styles.tileIcon}>
                      <GithubIcon size={18} />
                    </div>
                    <div className={styles.tileContent}>
                      <span className={styles.tileLabel}>GitHub</span>
                      <span className={styles.tileValue}>github.com/adityabhadauriawork</span>
                    </div>
                  </div>

                  <div className={styles.tileActions}>
                    <span className={styles.tileArrowWrap}>
                      <ArrowUpRight size={16} className={styles.tileArrow} />
                    </span>
                  </div>
                </a>

                {/* 4. LeetCode (Right) */}
                <a
                  href={siteConfig.socials.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.linkTile} ${styles.tileRight}`}
                  data-cursor="pointer"
                  aria-label="Visit Aditya's verified LeetCode profile"
                >
                  <div className={styles.tileMainContent}>
                    <div className={styles.tileIcon}>
                      <Code size={18} />
                    </div>
                    <div className={styles.tileContent}>
                      <span className={styles.tileLabel}>LeetCode</span>
                      <span className={styles.tileValue}>leetcode.com/u/aadi__bhadauria</span>
                    </div>
                  </div>

                  <div className={styles.tileActions}>
                    <span className={styles.tileArrowWrap}>
                      <ArrowUpRight size={16} className={styles.tileArrow} />
                    </span>
                  </div>
                </a>
              </div>

              {/* Scroll Back to Top Action */}
              <div className={styles.scrollTopRow}>
                <button
                  className={styles.scrollTopBtn}
                  onClick={handleScrollTop}
                  data-cursor="pointer"
                  aria-label="Return to top of page"
                >
                  <ArrowUp size={14} />
                  <span>Return to Top</span>
                </button>
              </div>
            </div>
          </RevealBlock>
        </div>

        {/* Thank-you Footer Beneath the Combined Composition */}
        <footer className={styles.footerBar}>
          <div className={styles.footerLeft}>
            <Heart size={14} className={styles.footerHeart} />
            <span>Thank you for reviewing my work and journey · Designed & Engineered by Aditya Pratap Singh Bhadauria · 2026</span>
          </div>
          <div className={styles.footerRight}>
            <Compass size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} color="#9333EA" />
            <span>B.Tech CSE '28 · PSIT Kanpur · React · TypeScript · Three.js</span>
          </div>
        </footer>
      </div>
    </section>
  );
};
