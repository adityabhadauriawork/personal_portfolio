/**
 * Portfolio Digital Asset Manifest
 * Centralized, typed asset registry for Aditya Pratap Singh Bhadauria's portfolio.
 * Tracks asset locations, display metadata, verification links, and readiness status.
 * All extensions match exact verified files in public/assets/portfolio.
 */

export interface PortfolioAsset {
  id: string;
  title: string;
  category: 'profile' | 'projects' | 'experience' | 'education' | 'certifications' | 'achievements' | 'flowers' | 'cv';
  assetPath: string;
  expectedFile: string;
  caption: string;
  date?: string;
  associatedEntity?: string;
  verificationLink?: string;
  status: 'available' | 'pending_evidence' | 'awaiting-upload';
}

export const portfolioAssetsManifest: PortfolioAsset[] = [
  // 1. Botanical Illustration (Contact Window)
  {
    id: 'contactFlower',
    title: 'Animated Floral Contact Illustration',
    category: 'flowers',
    assetPath: '/assets/portfolio/flowers/contact-flower.gif',
    expectedFile: 'public/assets/portfolio/flowers/contact-flower.gif',
    caption: 'Luminous purple-pink botanical animation with delicate petals, glowing center, and atmospheric lighting.',
    status: 'available',
  },

  // 2. CV Document (Secure Private Reference)
  {
    id: 'aditya-cv-document',
    title: 'Aditya Pratap Singh Bhadauria — Curriculum Vitae (Private Reference)',
    category: 'cv',
    assetPath: '/private_reference/cv/APSB_CV.pdf',
    expectedFile: 'private_reference/cv/APSB_CV.pdf',
    caption: 'Official CV kept in secure private reference, requested directly via prefilled email compose workflow.',
    status: 'available',
  },

  // 3. Experience Evidence (5 Internship Documents)
  {
    id: 'flyrank-ai-offer',
    title: 'FlyRank AI — Offer Letter',
    category: 'experience',
    assetPath: '/assets/portfolio/experience/flyrank-ai/offer-letter.jpg',
    expectedFile: 'public/assets/portfolio/experience/flyrank-ai/offer-letter.jpg',
    caption: 'Official Offer Letter for Machine Learning Engineering Internship at FlyRank AI.',
    associatedEntity: 'flyrank-ai',
    status: 'available',
  },
  {
    id: 'flyrank-ai-completion',
    title: 'FlyRank AI — Completion Letter',
    category: 'experience',
    assetPath: '/assets/portfolio/experience/flyrank-ai/completion-letter.jpg',
    expectedFile: 'public/assets/portfolio/experience/flyrank-ai/completion-letter.jpg',
    caption: 'Official Internship Completion Document from FlyRank AI.',
    associatedEntity: 'flyrank-ai',
    status: 'available',
  },
  {
    id: 'flyrank-ai-recommendation',
    title: 'FlyRank AI — Recommendation Letter',
    category: 'experience',
    assetPath: '/assets/portfolio/experience/flyrank-ai/recommendation-letter.jpg',
    expectedFile: 'public/assets/portfolio/experience/flyrank-ai/recommendation-letter.jpg',
    caption: 'Official Letter of Recommendation for Machine Learning Internship at FlyRank AI.',
    associatedEntity: 'flyrank-ai',
    status: 'available',
  },
  {
    id: 'prodigy-infotech-offer',
    title: 'Prodigy InfoTech — Offer Letter',
    category: 'experience',
    assetPath: '/assets/portfolio/experience/prodigy-infotech/offer-letter.jpg',
    expectedFile: 'public/assets/portfolio/experience/prodigy-infotech/offer-letter.jpg',
    caption: 'Official Offer Letter for Software Development Internship at Prodigy InfoTech.',
    associatedEntity: 'prodigy-infotech',
    status: 'available',
  },
  {
    id: 'prodigy-infotech-completion',
    title: 'Prodigy InfoTech — Completion Letter',
    category: 'experience',
    assetPath: '/assets/portfolio/experience/prodigy-infotech/completion-letter.jpg',
    expectedFile: 'public/assets/portfolio/experience/prodigy-infotech/completion-letter.jpg',
    caption: 'Official Internship Completion Certificate from Prodigy InfoTech.',
    associatedEntity: 'prodigy-infotech',
    status: 'available',
  },

  // 4. Certifications (10 Credentials)
  {
    id: 'cert-microsoft-data-science',
    title: 'Microsoft Learn — Data Science (Learning Achievements Summary)',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/microsoft-data-science.png',
    expectedFile: 'public/assets/portfolio/certifications/microsoft-data-science.png',
    caption: 'Combined portfolio summary of five completed Microsoft Learn modules covering data science, Python foundations, and predictive modeling.',
    associatedEntity: 'microsoft-data-science',
    status: 'available',
  },
  {
    id: 'cert-cisco-python-2',
    title: 'Cisco Networking Academy — Python Essentials 2',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/cisco-python-essentials-2.jpg',
    expectedFile: 'public/assets/portfolio/certifications/cisco-python-essentials-2.jpg',
    caption: 'Course completion credential in advanced Python, OOP paradigms, modular architecture, and file streams.',
    associatedEntity: 'cisco-python-essentials-2',
    status: 'available',
  },
  {
    id: 'cert-ibm-ml-nlp',
    title: 'IBM — Machine Learning & NLP',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/ibm-machine-learning-nlp.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-machine-learning-nlp.jpg',
    caption: 'IBM credential verifying machine learning algorithms, statistical regression, classification, and NLP pipelines.',
    associatedEntity: 'ibm-machine-learning-nlp',
    status: 'available',
  },
  {
    id: 'cert-ibm-ai-fundamentals',
    title: 'IBM — AI Fundamentals',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/ibm-ai-fundamentals.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-ai-fundamentals.jpg',
    caption: 'IBM SkillsBuild foundation credential in AI principles, cognitive architectures, and neural network foundations.',
    associatedEntity: 'ibm-ai-fundamentals',
    status: 'available',
  },
  {
    id: 'cert-deloitte-data-analytics',
    title: 'Deloitte — Data Analytics Job Simulation',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/deloitte-data-analytics-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/deloitte-data-analytics-simulation.jpg',
    caption: 'Deloitte Data Analytics Job Simulation completion verification via Forage.',
    associatedEntity: 'deloitte-data-analytics',
    status: 'available',
  },
  {
    id: 'cert-jpmorgan-swe',
    title: 'JPMorgan Chase & Co. — Software Engineering Job Simulation',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/jpmorgan-software-engineering-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/jpmorgan-software-engineering-simulation.jpg',
    caption: 'Certificate of completion for JPMorgan Chase & Co. Software Engineering Job Simulation via Forage.',
    associatedEntity: 'jpmorgan-chase-swe',
    status: 'available',
  },
  {
    id: 'cert-ibm-nlp-cv',
    title: 'IBM — NLP & Computer Vision',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/ibm-nlp-computer-vision.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-nlp-computer-vision.jpg',
    caption: 'IBM verified credential in Computer Vision feature extractors and Natural Language Processing pipelines.',
    associatedEntity: 'ibm-nlp-computer-vision',
    status: 'available',
  },
  {
    id: 'cert-bcg-data-analytics',
    title: 'BCG — Data Analytics Simulation',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/bcg-data-analytics-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/bcg-data-analytics-simulation.jpg',
    caption: 'BCG Data Analytics Job Simulation completion document via Forage, covering customer churn analysis and business modeling.',
    associatedEntity: 'bcg-data-analytics',
    status: 'available',
  },
  {
    id: 'cert-claude-ai-fluency',
    title: 'Claude — AI Fluency',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/claude-ai-fluency.jpg',
    expectedFile: 'public/assets/portfolio/certifications/claude-ai-fluency.jpg',
    caption: 'Technical proficiency credential in LLM prompting, architectural RAG workflows, and modern AI engineering patterns.',
    associatedEntity: 'claude-ai-fluency',
    status: 'available',
  },
  {
    id: 'cert-aws-cloud-practitioner',
    title: 'AWS — Cloud Practitioner',
    category: 'certifications',
    assetPath: '/assets/portfolio/certifications/aws-cloud-practitioner.jpg',
    expectedFile: 'public/assets/portfolio/certifications/aws-cloud-practitioner.jpg',
    caption: 'AWS Cloud Practitioner preparation curriculum, cloud economics, IAM security, and resilient infrastructure patterns.',
    associatedEntity: 'aws-cloud-practitioner',
    status: 'available',
  },

  // 5. Achievements Evidence (5 Proof Documents)
  {
    id: 'achieve-hack-the-future',
    title: 'Hack the Future 3.0 — National Hackathon',
    category: 'achievements',
    assetPath: '/assets/portfolio/achievements/hack-the-future-3-0.jpeg',
    expectedFile: 'public/assets/portfolio/achievements/hack-the-future-3-0.jpeg',
    caption: 'Official Certificate of Achievement & Participation for Hack the Future 3.0 National Hackathon.',
    associatedEntity: 'hack-the-future',
    status: 'available',
  },
  {
    id: 'achieve-isro-hackathon',
    title: 'ISRO Hackathon — National Participation',
    category: 'achievements',
    assetPath: '/assets/portfolio/achievements/isro-hackathon.jpg',
    expectedFile: 'public/assets/portfolio/achievements/isro-hackathon.jpg',
    caption: 'Official Certificate of Participation in the ISRO National Space Science & Robotics Hackathon.',
    associatedEntity: 'isro-hackathon',
    status: 'available',
  },
  {
    id: 'achieve-samsung-treasure-hunt',
    title: 'Rank 3 — Samsung Galaxy AI Treasure Hunt 2026',
    category: 'achievements',
    assetPath: '/assets/portfolio/achievements/samsung-treasure-hunt-air-3.png',
    expectedFile: 'public/assets/portfolio/achievements/samsung-treasure-hunt-air-3.png',
    caption: 'Samsung Galaxy AI Treasure Hunt 2026 Unstop outcome summary displaying recorded Rank 3 (status noted: Not Shortlisted; custom portfolio evidence summary).',
    associatedEntity: 'samsung-treasure-hunt',
    status: 'available',
  },
  {
    id: 'achieve-district-science',
    title: 'District Science Model Competition — First Prize',
    category: 'achievements',
    assetPath: '/assets/portfolio/achievements/district-science-first-prize.jpg',
    expectedFile: 'public/assets/portfolio/achievements/district-science-first-prize.jpg',
    caption: 'First Prize Certificate of Merit in District-Level Science Exhibition and Technological Demonstration.',
    associatedEntity: 'district-science-first-prize',
    status: 'available',
  },
  {
    id: 'achieve-build-with-bharat',
    title: 'Build With Bharat 2.0 — Finalist Track Participation',
    category: 'achievements',
    assetPath: '/assets/portfolio/achievements/build-with-bharat-2-0-participation.png',
    expectedFile: 'public/assets/portfolio/achievements/build-with-bharat-2-0-participation.png',
    caption: 'Official Certificate of Participation in the Build With Bharat 2.0 National Hackathon.',
    associatedEntity: 'build-with-bharat',
    status: 'available',
  },
];
