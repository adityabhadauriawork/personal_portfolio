import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import styles from './ImageLightboxModal.module.css';

export interface LightboxData {
  title: string;
  subtitle?: string;
  issuerOrCategory?: string;
  imagePath?: string;
  details?: string;
  tags?: string[];
  verificationNote?: string;
  verificationLink?: string;
  badge?: string;
}

interface ImageLightboxModalProps {
  data: LightboxData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [failedPaths, setFailedPaths] = useState<Record<string, boolean>>({});

  // ESC key dismiss & scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data || typeof document === 'undefined') return null;

  const currentPath = data.imagePath || '';
  const isPdf = currentPath.toLowerCase().endsWith('.pdf');
  const showDocument = Boolean(currentPath) && !failedPaths[currentPath];

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            {data.issuerOrCategory && (
              <span className={styles.issuerBadge}>
                <ShieldCheck size={13} />
                <span>{data.issuerOrCategory}</span>
              </span>
            )}
            <h3 id="lightbox-title" className={styles.title}>
              {data.title}
            </h3>
            {data.subtitle && (
              <span className={styles.subtitle}>{data.subtitle}</span>
            )}
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close enlarged preview"
            data-cursor="pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.previewCanvas}>
          {showDocument ? (
            isPdf ? (
              <div className={styles.pdfContainer}>
                <iframe
                  src={currentPath}
                  title={data.title}
                  className={styles.pdfFrame}
                />
                <div className={styles.pdfActions}>
                  <a
                    href={currentPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.openPdfBtn}
                    data-cursor="pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Open PDF in New Window</span>
                  </a>
                </div>
              </div>
            ) : (
              <img
                src={data.imagePath}
                alt={data.title}
                className={styles.previewImage}
                onError={() => {
                  if (currentPath) {
                    setFailedPaths((prev) => ({ ...prev, [currentPath]: true }));
                  }
                }}
              />
            )
          ) : (
            <div className={styles.fallbackCanvas}>
              <div className={styles.certificateSeal}>
                <ShieldCheck size={42} className={styles.sealIcon} />
              </div>
              <div className={styles.fallbackTitle}>{data.title}</div>
              <div className={styles.fallbackIssuer}>{data.issuerOrCategory}</div>
              <p className={styles.fallbackNotice}>
                Official documentation queued for asset upload. The verified high-resolution document will render directly in this viewer once placed in the asset directory.
              </p>
              {data.verificationNote && (
                <span className={styles.verificationNoteBadge}>
                  {data.verificationNote}
                </span>
              )}
              {data.verificationLink && (
                <a
                  href={data.verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalVerifyBtn}
                >
                  Verify Credential Online →
                </a>
              )}
            </div>
          )}
        </div>

        {data.details && (
          <div className={styles.detailsFooter}>
            <p className={styles.detailsText}>{data.details}</p>
            {data.tags && (
              <div className={styles.tagsRow}>
                {data.tags.map((t) => (
                  <span key={t} className={styles.tagPill}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
