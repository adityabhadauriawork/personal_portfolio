export interface AchievementItem {
  id: string;
  metric: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  context: string;
  highlightColor: string;
  evidence: {
    expectedFile: string;
    assetPath: string;
    caption: string;
    verificationNote: string;
    finalistProofPath?: string;
  };
}

export const achievementsData: AchievementItem[] = [
  {
    id: 'samsung-treasure-hunt',
    metric: '3',
    numericValue: 3,
    prefix: 'AIR ',
    title: 'Rank 3 — Samsung Galaxy AI Treasure Hunt 2026',
    category: 'National Competition',
    subtitle: 'All India Rank 3 · Samsung & Unstop Result',
    description:
      'Secured All India Rank 3 in the Samsung Galaxy AI Treasure Hunt 2026 on Unstop, solving multi-stage algorithmic puzzles under strict time limits. The verified result preserves the recorded Rank 3 standing.',
    context: 'National Competitive Technical Challenge',
    highlightColor: '#963BFA',
    evidence: {
      expectedFile: 'public/assets/portfolio/achievements/samsung-treasure-hunt-air-3.png',
      assetPath: '/assets/portfolio/achievements/samsung-treasure-hunt-air-3.png',
      caption: 'Rank 3 — Samsung Galaxy AI Treasure Hunt 2026 (Unstop Result Evidence)',
      verificationNote: 'Recorded All India Rank 3 on Unstop result leaderboard. Preserves factual competition standing.',
    },
  },
  {
    id: 'hack-the-future',
    metric: '3.0',
    numericValue: 3,
    prefix: 'Hack ',
    title: 'Hack the Future 3.0',
    category: 'National Hackathon',
    subtitle: 'National Technical Challenge & Hackathon Achievement',
    description:
      'Participated and earned distinction in Hack the Future 3.0, navigating rigorous technical rounds and designing an end-to-end working engineering architecture.',
    context: 'National Hackathon & Development Sprint',
    highlightColor: '#8E65E2',
    evidence: {
      expectedFile: 'public/assets/portfolio/achievements/hack-the-future-3-0.jpeg',
      assetPath: '/assets/portfolio/achievements/hack-the-future-3-0.jpeg',
      caption: 'Hack the Future 3.0 — Certificate of Participation & Achievement',
      verificationNote: 'Official certificate for Hack the Future 3.0 national hackathon.',
    },
  },
  {
    id: 'isro-hackathon',
    metric: 'ISRO',
    title: 'ISRO Hackathon',
    category: 'National Aerospace & Space Tech',
    subtitle: 'National Space Technology Engineering Challenge',
    description:
      'Competed in the prestigious ISRO Hackathon, engineering technical solutions addressing geospatial data, algorithmic problem spaces, and high-reliability computing requirements.',
    context: 'Indian Space Research Organisation Technical Challenge',
    highlightColor: '#A98AE8',
    evidence: {
      expectedFile: 'public/assets/portfolio/achievements/isro-hackathon.jpg',
      assetPath: '/assets/portfolio/achievements/isro-hackathon.jpg',
      caption: 'ISRO Hackathon Official Certificate',
      verificationNote: 'Verified certificate of participation and performance in ISRO Hackathon.',
    },
  },
  {
    id: 'district-science-first-prize',
    metric: '1',
    numericValue: 1,
    prefix: '#',
    suffix: ' Prize',
    title: 'District Science Model Competition',
    category: 'Innovation & Hardware Systems',
    subtitle: 'First Prize in District-Level Science Exhibition',
    description:
      'Awarded First Prize for designing and demonstrating an applied technical model addressing real-world operational challenges, evaluated on innovation, feasibility, and technical execution.',
    context: 'District Level Science & Engineering Showcase',
    highlightColor: '#D946EF',
    evidence: {
      expectedFile: 'public/assets/portfolio/achievements/district-science-first-prize.jpg',
      assetPath: '/assets/portfolio/achievements/district-science-first-prize.jpg',
      caption: 'First Prize Merit Certificate — District Science Model Competition',
      verificationNote: 'Awarded First Prize for applied engineering model and presentation.',
    },
  },
  {
    id: 'build-with-bharat',
    metric: 'Final',
    title: 'Build With Bharat 2.0',
    category: 'National Innovation Challenge',
    subtitle: 'National Finalist (Participation Certificate Available)',
    description:
      'Recognized as a Grand Finalist in the Build With Bharat 2.0 national innovation sprint. The currently uploaded document is the official Participation Certificate; dedicated finalist documentation is reserved upon issuance.',
    context: 'Build With Bharat 2.0 National Hackathon',
    highlightColor: '#552080',
    evidence: {
      expectedFile: 'public/assets/portfolio/achievements/build-with-bharat-2-0-participation.png',
      assetPath: '/assets/portfolio/achievements/build-with-bharat-2-0-participation.png',
      caption: 'Build With Bharat 2.0 — Participation Certificate (Finalist Standing Document Pending)',
      verificationNote: 'Attached evidence: Participation Certificate. Finalist status documented.',
      finalistProofPath: '/assets/portfolio/achievements/build-with-bharat-2-0-finalist.webp',
    },
  },
  {
    id: 'leetcode-solved',
    metric: '400',
    numericValue: 400,
    suffix: '+',
    title: '400+ DSA Problems Solved',
    category: 'Algorithmic Problem Solving',
    subtitle: 'Multi-Platform Algorithmic Rigor',
    description:
      '400+ DSA problems solved across LeetCode, HackerRank, Codeforces, and other coding platforms, focusing on optimal algorithmic complexity, graph traversal, and dynamic programming.',
    context: 'Algorithmic Problem Solving Across Coding Platforms',
    highlightColor: '#963BFA',
    evidence: {
      expectedFile: 'siteConfig.socials.leetcode',
      assetPath: 'https://leetcode.com/u/aadi__bhadauria/',
      caption: 'LeetCode Profile: https://leetcode.com/u/aadi__bhadauria/',
      verificationNote: 'Verified profile: https://leetcode.com/u/aadi__bhadauria/',
    },
  },
];
