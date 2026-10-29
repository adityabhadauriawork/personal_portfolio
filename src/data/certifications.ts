export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  category: string;
  badge: string;
  type: 'job_simulation' | 'course_certificate' | 'learning_path' | 'credential_in_progress';
  dateOrCohort?: string;
  summary: string;
  skillsVerified: string[];
  imagePath?: string;
  expectedFile: string;
  verificationNote: string;
}

export const certificationsData: CertificationItem[] = [
  {
    id: 'microsoft-data-science',
    title: 'Data Science (Learning Achievements Summary)',
    issuer: 'Microsoft Learn',
    category: 'Data Science & Analytical Foundations',
    badge: 'Learning Modules Summary',
    type: 'learning_path',
    dateOrCohort: 'Microsoft Learn',
    summary:
      'A verified portfolio summary of five completed Microsoft Learn modules covering exploratory data analysis, statistical principles, regression modeling, and Azure ML foundations.',
    skillsVerified: ['Data Analysis', 'Python', 'Statistical Modeling', 'Exploratory Data Analysis', 'Machine Learning Foundations'],
    imagePath: '/assets/portfolio/certifications/microsoft-data-science.png',
    expectedFile: 'public/assets/portfolio/certifications/microsoft-data-science.png',
    verificationNote: 'Microsoft Learn portfolio summary covering 5 data science learning modules (portfolio summary, not a single issuer-issued credential).',
  },
  {
    id: 'cisco-python-essentials-2',
    title: 'Python Essentials 2',
    issuer: 'Cisco Networking Academy',
    category: 'Object-Oriented Programming & Systems',
    badge: 'Course Certificate',
    type: 'course_certificate',
    dateOrCohort: 'Cisco NetAcad Assessment',
    summary:
      'Completed comprehensive curriculum and final assessment on advanced Python concepts including OOP, package architecture, custom exceptions, closures, and file streams.',
    skillsVerified: ['OOP & Inheritance', 'Generators & Closures', 'File I/O & Streams', 'Module Architecture', 'Exception Handling'],
    imagePath: '/assets/portfolio/certifications/cisco-python-essentials-2.jpg',
    expectedFile: 'public/assets/portfolio/certifications/cisco-python-essentials-2.jpg',
    verificationNote: 'Course completion certificate verified via Cisco Networking Academy.',
  },
  {
    id: 'ibm-machine-learning-nlp',
    title: 'Machine Learning & NLP',
    issuer: 'IBM',
    category: 'Artificial Intelligence & Natural Language',
    badge: 'Professional Specialization Module',
    type: 'course_certificate',
    dateOrCohort: 'IBM Training',
    summary:
      'Rigorous training in supervised/unsupervised machine learning algorithms, text preprocessing, tokenization, TF-IDF vectorization, and sequence classification.',
    skillsVerified: ['Machine Learning', 'Natural Language Processing', 'Text Preprocessing', 'Scikit-Learn', 'Feature Engineering'],
    imagePath: '/assets/portfolio/certifications/ibm-machine-learning-nlp.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-machine-learning-nlp.jpg',
    verificationNote: 'Verified IBM credential in Machine Learning and Natural Language Processing.',
  },
  {
    id: 'ibm-ai-fundamentals',
    title: 'AI Fundamentals',
    issuer: 'IBM',
    category: 'Artificial Intelligence & Cognitive Systems',
    badge: 'Foundations Credential',
    type: 'learning_path',
    dateOrCohort: 'IBM SkillsBuild',
    summary:
      'Foundational curriculum covering artificial intelligence concepts, cognitive computing architectures, ethical AI principles, and modern machine learning paradigms.',
    skillsVerified: ['AI Principles', 'Cognitive Systems', 'Ethics in AI', 'Neural Network Basics', 'Applied AI Workflows'],
    imagePath: '/assets/portfolio/certifications/ibm-ai-fundamentals.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-ai-fundamentals.jpg',
    verificationNote: 'IBM SkillsBuild verified AI Fundamentals badge credential.',
  },
  {
    id: 'deloitte-data-analytics-simulation',
    title: 'Data Analytics Job Simulation',
    issuer: 'Deloitte',
    category: 'Data Analytics & Business Intelligence',
    badge: 'Job Simulation (Forage)',
    type: 'job_simulation',
    dateOrCohort: 'Completed via Forage',
    summary:
      'Practical corporate simulation focused on dataset auditing, exploratory analysis, client dashboard presentation, and forensic data modeling.',
    skillsVerified: ['Data Analytics', 'Business Intelligence', 'Data Storytelling', 'Dashboard Design', 'Client Presentation'],
    imagePath: '/assets/portfolio/certifications/deloitte-data-analytics-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/deloitte-data-analytics-simulation.jpg',
    verificationNote: 'Practical job simulation completion document verified via Forage.',
  },
  {
    id: 'jpmorgan-software-engineering-simulation',
    title: 'Software Engineering Job Simulation',
    issuer: 'JPMorgan Chase & Co.',
    category: 'Enterprise Engineering & Financial Systems',
    badge: 'Job Simulation (Forage)',
    type: 'job_simulation',
    dateOrCohort: 'Completed via Forage',
    summary:
      'Completed practical engineering tasks covering financial market data feed streaming, perspective data visualization, and unit testing within a simulated enterprise codebase.',
    skillsVerified: ['Financial Data Feeds', 'Perspective Visualization', 'Unit Testing', 'TypeScript/Python', 'Git Workflows'],
    imagePath: '/assets/portfolio/certifications/jpmorgan-software-engineering-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/jpmorgan-software-engineering-simulation.jpg',
    verificationNote: 'Completed practical engineering job simulation on Forage.',
  },
  {
    id: 'ibm-nlp-computer-vision',
    title: 'NLP & Computer Vision',
    issuer: 'IBM',
    category: 'Multimodal Deep Learning',
    badge: 'Advanced Technical Certificate',
    type: 'course_certificate',
    dateOrCohort: 'IBM Professional Learning',
    summary:
      'Exploration of convolutional neural networks (CNNs), transformer architectures, object detection, image classification, and joint vision-language modeling.',
    skillsVerified: ['Computer Vision', 'Convolutional Networks', 'NLP Transformers', 'PyTorch / TensorFlow', 'Image Classification'],
    imagePath: '/assets/portfolio/certifications/ibm-nlp-computer-vision.jpg',
    expectedFile: 'public/assets/portfolio/certifications/ibm-nlp-computer-vision.jpg',
    verificationNote: 'IBM verified credential in Computer Vision and Natural Language Processing.',
  },
  {
    id: 'bcg-data-analytics-simulation',
    title: 'Data Analytics Simulation',
    issuer: 'BCG',
    category: 'Strategic Analytics & Business Problem Solving',
    badge: 'Job Simulation (Forage)',
    type: 'job_simulation',
    dateOrCohort: 'Completed via Forage',
    summary:
      'Conducted churn hypothesis formulation, customer exploratory data analysis, feature engineering, and statistical modeling for enterprise strategic advisory.',
    skillsVerified: ['Customer Churn Analysis', 'Feature Engineering', 'Hypothesis Testing', 'Data Analysis', 'Executive Synthesis'],
    imagePath: '/assets/portfolio/certifications/bcg-data-analytics-simulation.jpg',
    expectedFile: 'public/assets/portfolio/certifications/bcg-data-analytics-simulation.jpg',
    verificationNote: 'Completed BCG Data Analytics Job Simulation via Forage.',
  },
  {
    id: 'claude-ai-fluency',
    title: 'AI Fluency',
    issuer: 'Claude / Anthropic',
    category: 'Generative AI & LLM Engineering',
    badge: 'Technical Fluency Credential',
    type: 'course_certificate',
    dateOrCohort: 'AI Fluency Program',
    summary:
      'Mastery of prompt engineering patterns, retrieval-augmented generation (RAG) paradigms, agentic workflow orchestration, and safe model deployment.',
    skillsVerified: ['Prompt Engineering', 'RAG Architectures', 'Agentic Workflows', 'LLM Alignment', 'API Integration'],
    imagePath: '/assets/portfolio/certifications/claude-ai-fluency.jpg',
    expectedFile: 'public/assets/portfolio/certifications/claude-ai-fluency.jpg',
    verificationNote: 'Verification of AI Fluency curriculum and applied LLM workflows.',
  },
  {
    id: 'aws-cloud-practitioner',
    title: 'Cloud Practitioner',
    issuer: 'AWS',
    category: 'Cloud Infrastructure & Architecture',
    badge: 'Foundations & Certification Track',
    type: 'credential_in_progress',
    dateOrCohort: 'AWS Cloud Foundations',
    summary:
      'Comprehensive preparation covering AWS core services (EC2, S3, RDS, Lambda), cloud security, architectural best practices, and billing management.',
    skillsVerified: ['AWS Core Services', 'Cloud Architecture', 'IAM & Security', 'Serverless Concepts', 'Cost Optimization'],
    imagePath: '/assets/portfolio/certifications/aws-cloud-practitioner.jpg',
    expectedFile: 'public/assets/portfolio/certifications/aws-cloud-practitioner.jpg',
    verificationNote: 'AWS Cloud Practitioner preparation and foundational curriculum verification.',
  },
];
