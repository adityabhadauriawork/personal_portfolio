# Document Evidence & Floral Asset Upload Guide
**Project Aditya — Verified Evidence & Architectural Botanical System**  
*Pranveer Singh Institute of Technology (PSIT), Kanpur · B.Tech CSE (2024–2028)*

This guide provides instructions for uploading verified internship documents, recommendation letters, professional certifications, competitive achievement proofs, and the animated botanical flower GIF into your portfolio.

---

## ⚠️ Important Asset Privacy & Redaction Warning

> **PUBLIC ACCESSIBILITY NOTICE**: Any file placed in the `public/` directory becomes publicly accessible over the internet once the portfolio is deployed.
>
> Before publishing, inspect all documents (especially **Offer Letters**, **Completion Certificates**, and **Letters of Recommendation**) for sensitive private data:
> - Personal residential addresses
> - Private phone numbers
> - Personal government ID numbers (Aadhaar, PAN, SSN)
> - Private bank details or compensation figures
> - Direct personal signatures (if confidentiality is desired)
>
> **Policy**: Do not upload unvetted documents containing employer-confidential clauses or unredacted personal identifiers. Redact sensitive personal data using an image or PDF editor before copying the file to the asset directory.

---

## 1. Directory Structure & File Mapping

Place your files into the designated paths listed below. The UI and centralized asset manifest are connected to these paths and will display your uploaded assets immediately upon page refresh.

### A. Internship Experience Evidence (5 Documents)

| Folder Path | Expected Filename | Corresponding UI Entry | Evidence Type |
|---|---|---|---|
| `public/assets/portfolio/experience/flyrank-ai/` | `offer-letter.webp` | FlyRank AI (Machine Learning Engineering Intern) | Appointment / Offer Letter |
| `public/assets/portfolio/experience/flyrank-ai/` | `completion-letter.webp` | FlyRank AI (Machine Learning Engineering Intern) | Internship Completion Letter |
| `public/assets/portfolio/experience/flyrank-ai/` | `recommendation-letter.webp` | FlyRank AI (Machine Learning Engineering Intern) | Machine Learning Recommendation Letter |
| `public/assets/portfolio/experience/prodigy-infotech/` | `offer-letter.webp` | Prodigy InfoTech (Software Development Intern) | Appointment / Offer Letter |
| `public/assets/portfolio/experience/prodigy-infotech/` | `completion-letter.webp` | Prodigy InfoTech (Software Development Intern) | Internship Completion Letter |

---

### B. Certification Credentials (10 Documents)

All certificate files belong in `public/assets/portfolio/certifications/`:

| Expected Filename | Credential Title | Issuing Organization | Category / Track |
|---|---|---|---|
| `microsoft-data-science.webp` | Data Science | Microsoft | Learning Path / Credential |
| `cisco-python-essentials-2.webp` | Python Essentials 2 | Cisco Networking Academy | Course Assessment Certificate |
| `ibm-machine-learning-nlp.webp` | Machine Learning & NLP | IBM | Professional Learning Specialization |
| `ibm-ai-fundamentals.webp` | AI Fundamentals | IBM SkillsBuild | Cognitive Systems Foundations |
| `deloitte-data-analytics-simulation.webp` | Data Analytics Job Simulation | Deloitte (Forage) | Applied Job Simulation |
| `jpmorgan-software-engineering-simulation.webp` | Software Engineering Job Simulation | JPMorgan Chase & Co. (Forage) | Enterprise Engineering Simulation |
| `ibm-nlp-computer-vision.webp` | NLP & Computer Vision | IBM | Multimodal Deep Learning Certificate |
| `bcg-data-analytics-simulation.webp` | Data Analytics Simulation | BCG (Forage) | Strategic Analytics Simulation |
| `claude-ai-fluency.webp` | AI Fluency | Claude / Anthropic | LLM Prompting & Agent Workflows |
| `aws-cloud-practitioner.webp` | Cloud Practitioner | AWS | Cloud Foundations Track |

---

### C. Achievement Proof Documents (5 Documents)

All achievement evidence files belong in `public/assets/portfolio/achievements/`:

| Expected Filename | Achievement Entry | Issuing Body / Event | Evidence Classification |
|---|---|---|---|
| `hack-the-future-3-0.webp` | Hack the Future 3.0 | National Hackathon | Certificate of Participation & Achievement |
| `isro-hackathon.webp` | ISRO Hackathon | ISRO / Aerospace Tech | Official Hackathon Certificate |
| `samsung-treasure-hunt-air-3.webp` | Samsung Treasure Hunt 2026 — AIR 3 | Samsung Technical Challenge | National Rank 3 Merit Certificate |
| `district-science-first-prize.webp` | District Science Model Competition | District Science Showcase | First Prize Award Certificate |
| `build-with-bharat-2-0-participation.webp` | Build With Bharat 2.0 (Finalist) | Build With Bharat | **Participation Certificate** *(Finalist standing pending)* |

> **Truth in Evidence Rule**: For *Build With Bharat 2.0*, the current attached document is classified accurately as a **Participation Certificate**. A dedicated file slot (`build-with-bharat-2-0-finalist.webp`) is reserved in the manifest for when dedicated finalist documentation is provided.

---

### D. Animated Botanical Flower Asset (Contact Section)

| Folder Path | Expected Filename | Corresponding UI Entry | Asset Classification |
|---|---|---|---|
| `public/assets/portfolio/flowers/` | `contact-flower.gif` | Chapter 11 Contact — Botanical Window | Animated Floral Contact Illustration |

- **Placement**: Save your animated flower GIF as `contact-flower.gif` inside `public/assets/portfolio/flowers/`.
- **Automatic Display**: The Botanical Window component renders it automatically inside its architectural arched frame without requiring code changes.
- **Animation Fidelity**: Rendered using a native image element preserving frame rate and looping.
- **Stage Integration**: The deep-plum and violet atmospheric inner viewport gracefully complements dark-background or transparent floral animations while transitioning softly into the surrounding lavender-and-pearl portfolio palette.

---

### E. Curriculum Vitae Document

| Folder Path | Expected Filename | Purpose |
|---|---|---|
| `public/assets/cv/` | `Aditya-Pratap-Singh-Bhadauria-CV.pdf` | Official downloadable / viewable resume |

---

## 2. Supported Formats & Changing File Extensions

The application natively supports:
- **`.webp`** (Recommended for static image evidence and high web performance)
- **`.png`**
- **`.jpg` / `.jpeg`**
- **`.gif`** (Preserves native multi-frame animation playback for the Botanical Window)
- **`.pdf`** (Renders in high-resolution interactive viewer with full-screen opening option)

### How to use `.png`, `.jpg`, or `.pdf` instead of `.webp`
If your document is `my-certificate.pdf` or `offer.png`, you do **not** need to touch React components. Simply update the asset path in `src/data/assetsManifest.ts` (and the corresponding item in `src/data/experience.ts`, `src/data/certifications.ts`, or `src/data/achievements.ts`):

```typescript
// Example: in src/data/experience.ts
{
  id: 'flyrank-offer',
  type: 'offer-letter',
  label: 'Offer Letter',
  expectedFile: 'public/assets/portfolio/experience/flyrank-ai/offer-letter.pdf',
  assetPath: '/assets/portfolio/experience/flyrank-ai/offer-letter.pdf', // Updated to .pdf
  verificationNote: '...',
}
```

---

## 3. How Missing Assets Are Handled

If an asset has not been uploaded yet:
1. The portfolio will **never display a broken image icon** or blank dark box.
2. **Credential & Achievement Cards**: The card displays its complete title, issuer, date, and description. Flipping the card or opening the lightbox displays an intentional **"Evidence awaiting upload"** verification seal showing the expected file path and verification metadata.
3. **Botanical Window**: Displays a glowing, luminous SVG botanical illustration with violet-orchid petals and radiant golden stamen lighting, with an architectural status badge indicating that the slot is awaiting `contact-flower.gif`.
4. Once you drop the file into the corresponding folder, the real asset automatically renders in place of the placeholder!

---

## 4. Verification Workflow

After copying files to the `public/assets/portfolio/...` folders:
1. Open the website at `http://localhost:5173/` (or run `npm run dev`).
2. Navigate to **Experience (Chapter 05)**:
   - Click each credential card to flip it and view the revealed evidence.
   - Click "Enlarge Document" to confirm contain-to-fit sizing, zoom, and escape-key dismissal.
3. Navigate to **Certificates (Chapter 08)**:
   - Click each of the 10 certificate sleeves to test the 3D flip.
   - Verify that the section heading is completely visible and readable below the navigation.
4. Navigate to **Achievements (Chapter 06)**:
   - Verify the progression railway and flip cards.
5. Navigate to **Contact (Chapter 11)**:
   - Verify the Botanical Window is centered within its architectural frame.
   - Verify the closing message and 4 contact coordinates (Email with copy button, LinkedIn, GitHub, LeetCode) are aligned and functional.
   - Verify the thank-you footer is situated below the composition.
6. Check your browser console to verify zero 404 network warnings for uploaded assets.
