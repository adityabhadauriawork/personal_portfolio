import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, GraduationCap, CheckCircle } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import { siteConfig } from '../../data/siteConfig';
import styles from './ContactModal.module.css';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen } = useExperience();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isContactModalOpen) {
      setSubmitted(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsContactModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isContactModalOpen, setIsContactModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitted(true);
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n---\nFrom: ${name} (${email})`);
    setTimeout(() => {
      window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setIsContactModalOpen(false);
    }
  };

  if (!isContactModalOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Direct Project Inquiry & Contact"
    >
      <div className={styles.modalCard} ref={cardRef}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Initiate Collaboration</h2>
            <p className={styles.modalSubtitle}>
              Let’s explore intelligent systems, AI engineering, or innovative applications.
            </p>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsContactModalOpen(false)}
            aria-label="Close dialog"
            data-cursor="pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Identity & Educational Anchor */}
        <div className={styles.infoCluster}>
          <div className={styles.infoRow}>
            <GraduationCap size={15} color="var(--color-purple-electric)" />
            <span>Aditya Pratap Singh Bhadauria · PSIT Kanpur (CSE '28)</span>
          </div>
          <div className={styles.infoRow}>
            <MapPin size={15} color="var(--color-purple-electric)" />
            <span>Kanpur, India · Available for Remote & On-Site Opportunities</span>
          </div>
        </div>

        {submitted ? (
          <div className={styles.successMessage}>
            <CheckCircle size={28} color="#16a34a" style={{ margin: '0 auto 0.6rem' }} />
            <strong>Inquiry Dispatched</strong>
            <p style={{ marginTop: '0.4rem', fontSize: '0.82rem' }}>
              Your default email client has been prepared pre-addressed to <strong>{siteConfig.email}</strong>.
            </p>
            <button
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.2rem',
                borderRadius: '999px',
                background: '#166534',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
              onClick={() => setIsContactModalOpen(false)}
            >
              Done
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="inquiry-name">Your Name</label>
              <input
                id="inquiry-name"
                type="text"
                className={styles.input}
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="inquiry-email">Email Address</label>
              <input
                id="inquiry-email"
                type="email"
                className={styles.input}
                placeholder="alex@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="inquiry-message">Inquiry / Message</label>
              <textarea
                id="inquiry-message"
                className={styles.textarea}
                placeholder="Tell me about your project, research scope, or internship opportunity..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton} data-cursor="pointer">
              <span>Send Message</span>
              <Send size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
