import React from 'react';
import { Mail, FileText, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter10_CV.module.css';

export const Chapter10CV: React.FC = () => {
  const emailAddress = siteConfig.email;
  const emailSubject = 'Request for CV — Aditya Pratap Singh Bhadauria';
  const emailBody = `Hi Aditya,

I came across your portfolio and would like to review your current curriculum vitae for upcoming software engineering and AI/ML opportunities.

Best regards,`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    emailAddress
  )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const defaultMailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  return (
    <section id="cv" className={styles.section} aria-label="Request CV">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>CV / 10</span>
            <span className={styles.separator}>·</span>
            <span>CURRICULUM VITAE</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            The complete profile, on request.
          </RevealText>
          <p className={styles.subheadline}>
            For internship, engineering, or collaboration opportunities, request a copy of my current CV by email.
          </p>
        </div>

        {/* Editorial Request Folio Card */}
        <RevealBlock className={styles.requestCardWrapper} delayMs={100}>
          <div className={styles.requestCard}>
            {/* Left: Document Icon & Security Monogram */}
            <div className={styles.documentVisualCol}>
              <div className={styles.documentSleeve}>
                <div className={styles.sleeveSeal}>
                  <FileText size={32} className={styles.fileIcon} />
                </div>
                <div className={styles.sleeveWatermark}>ADITYA · CV</div>
                <div className={styles.sleeveLines}>
                  <div className={styles.mockLine} style={{ width: '85%' }} />
                  <div className={styles.mockLine} style={{ width: '60%' }} />
                  <div className={styles.mockLine} style={{ width: '75%' }} />
                  <div className={styles.mockLine} style={{ width: '45%' }} />
                </div>
                <span className={styles.badgeProtected}>Direct Verified Dispatch</span>
              </div>
            </div>

            {/* Right: Copy & Prominent Action */}
            <div className={styles.actionCol}>
              <div className={styles.actionHeader}>
                <span className={styles.tagBadge}>Official Candidate Dossier</span>
                <span className={styles.statusDot}>Updated for 2026</span>
              </div>

              <h3 className={styles.actionTitle}>
                Direct Delivery via Email
              </h3>

              <p className={styles.actionText}>
                I share my full CV directly with recruiters, engineering leads, and collaborators. Click below to open a prefilled draft in Gmail or your preferred email application.
              </p>

              {/* Primary Action Button: Open Gmail Draft */}
              <div className={styles.buttonGroup}>
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryRequestBtn}
                  data-cursor="pointer"
                  aria-label="Request CV via Gmail compose draft"
                >
                  <Mail size={16} />
                  <span>Request My CV (Gmail Draft)</span>
                  <ArrowUpRight size={14} />
                </a>

                {/* Secondary Fallback: Default Mailto */}
                <a
                  href={defaultMailtoUrl}
                  className={styles.fallbackLink}
                  data-cursor="pointer"
                  aria-label="Open default mail client to request CV"
                >
                  <span>Or use default email client ({emailAddress})</span>
                </a>
              </div>

              {/* Guarantees */}
              <div className={styles.guaranteeRow}>
                <div className={styles.guaranteeItem}>
                  <ShieldCheck size={14} className={styles.guaranteeIcon} />
                  <span>No automated tracking</span>
                </div>
                <div className={styles.guaranteeItem}>
                  <Sparkles size={14} className={styles.guaranteeIcon} />
                  <span>Fast reply within 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
};
