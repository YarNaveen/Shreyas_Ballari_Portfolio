/**
 * Single source of truth for every tab (Classic, Creative, Studio).
 *
 * Rules (agreed with the family — see README "Privacy rules"):
 * - Only confirmed facts go in as plain values. Facts come from the architecture doc of 2026-11-03
 *   and the family's details of 2026-11-10 (grade, school town, subjects, research interests, the
 *   stock app, courses, languages, achievements, activities and goals).
 * - Anything not yet supplied is wrapped in `placeholder(...)` and renders with a visible
 *   "To be supplied" label so nobody mistakes it for real content.
 * - Prose marked `draft(...)` is wording we wrote around confirmed facts; Shreyas should approve or
 *   rewrite it before launch.
 * - Never add an email, phone number, home address, home town, birth date or schedule here.
 */

export interface Copy {
  text: string;
  status: 'confirmed' | 'draft' | 'placeholder';
}

const confirmed = (text: string): Copy => ({ text, status: 'confirmed' });
const draft = (text: string): Copy => ({ text, status: 'draft' });
const placeholder = (text: string): Copy => ({ text, status: 'placeholder' });

export const profile = {
  name: 'Shreyas Ballari',
  firstName: 'Shreyas',
  lastName: 'Ballari',
  grade: 'Junior',
  school: 'Fulton Science Academy',
  schoolShort: 'FSA',
  schoolTown: 'Alpharetta, Georgia',
  state: 'Georgia',
  /** Photo supplied by the family (transparent background). */
  portrait: `${import.meta.env.BASE_URL}assets/shreyas/portrait.png`,
  /** Approved public email: none. Contact goes through the form to a family inbox. */
  socials: [] as { label: string; url: string }[],
};

/** Public contact details, shown in the Classic footer (approved by the family on 2026-11-17), shown in every portfolio. */
export const contact = {
  email: 'shreyasballari2010@gmail.com',
  phone: '415-581-5887',
  /** His resume (the original file, chosen by the family on 2026-11-17). */
  resume: `${import.meta.env.BASE_URL}assets/Shreyas_Ballari_Resume.pdf`,
};

/** Subjects he is most drawn to. */
export const subjects = ['Computer Science', 'Artificial Intelligence', 'Business and FinTech'];

/** What he wants to research. */
export const researchInterests = [
  { title: 'AI in oncology', line: 'Using artificial intelligence in cancer research.' },
  { title: 'AI-enabled trading', line: 'An AI-powered platform that helps people trade with more confidence.' },
];

export const courses = [
  'AP Computer Science Principles',
  'AP Computer Science A',
  'AP Precalculus',
  'AP Biology',
  'AP Chemistry',
  'AP Physics C',
  'Artificial Intelligence',
  'English Literature Honors',
  'Spanish Honors',
  'Entrepreneurship',
];

export const languages = ['JavaScript', 'Python', 'Java'];

/** Courses for the Classic "Technical skills & courses" page, as listed by the family (2026-11-18). */
export const skillsCourses = {
  ap: ['AP Computer Science Principles', 'AP Computer Science A', 'AP Biology', 'AP Chemistry', 'AP Physics C'],
  other: ['Artificial Intelligence', 'English Literature Honors', 'Spanish Honors', 'Entrepreneurship'],
};

/** The stock trading app, in plain words (from Shreyas's own description). */
export const stockApp = {
  name: 'Stock Trading Application',
  status: 'Concept',
  /** One line under the title. */
  tagline: 'A beginner-friendly stock trading website that is easy and welcoming for veterans too.',
  summary:
    'A stock trading website that is beginner-friendly, and easy and welcoming for veterans too. It uses algorithms and real-world data to work out the best hypothetical choice when buying a stock, and gives you a time frame for when to buy and when to sell. Instead of the candlesticks and equations experienced traders rely on, it uses an AI model to streamline buying and selling, with useful advice for anyone who is interested.',
  /** "To simplify", in his words. */
  simple:
    'To simplify: an AI model uses real-world data and algorithms to advise how much of a stock to buy, when to buy it and an estimate of when to sell it, based on real-world factors, and shows all of this next to the stock graph you are looking at. A dashboard shows the stocks you hold and the buy or sell stage each one is at, your pending buys and sells, and top-performing stocks you may be interested in.',
  features: [
    { title: 'AI advice next to the chart', line: 'How much to buy, when to buy and an estimated time to sell, shown beside the graph you are looking at.' },
    { title: 'Real-world data', line: 'Advice based on real market data and real-world factors, worked out with algorithms.' },
    { title: 'Your dashboard', line: 'The stocks you hold and the buy or sell stage each one is at.' },
    { title: 'Pending orders', line: 'Buys and sells that are still waiting to go through.' },
    { title: 'Top performers', line: 'Top-performing stocks you may be interested in.' },
    { title: 'Smart calculators', line: 'Calculators that use the AI model to suggest timing and the best amount to buy.' },
    { title: 'Everything a trading site needs', line: 'A dashboard, current stocks, what you hold, ways to buy and sell, and a progress graph for each stock.' },
  ],
  forWhom: 'Beginners who want clear advice without candlesticks or equations, and veterans who want an easier, faster way to decide.',
  /** Why it is different, in plain words. */
  approach: [
    'No candlesticks or equations to learn: an AI model does that work for you.',
    'Algorithms and real-world data suggest the best hypothetical choice for each stock.',
    'A time frame for when to buy and an estimate of when to sell, based on real-world factors.',
    'Useful advice along the way, for anyone who wants to learn.',
  ],
};

export interface Achievement {
  id: string;
  title: string;
  value: string;
  detail: string;
  when: string;
  kind: 'Score' | 'Award' | 'Honor' | 'Program' | 'Certificate';
}

export const achievements: Achievement[] = [
  {
    id: 'nmsc',
    kind: 'Honor',
    title: 'National Merit Recognition',
    value: '99th percentile and above',
    when: '11th grade PSAT',
    detail: 'Grade 11 PSAT: 99th percentile and above. Qualified for National Merit Scholarship recognition.',
  },
  { id: 'cbnrp', kind: 'Award', title: 'College Board National Recognition Program', value: 'Recipient', when: 'Award', detail: 'Recipient of the College Board National Recognition Program award.' },
  { id: 'honors', kind: 'Honor', title: 'Principal’s Honors List', value: '2025 · 2026', when: 'FSA', detail: 'Named to the Principal’s Honors List at Fulton Science Academy in 2025 and 2026.' },
  { id: 'psat', kind: 'Score', title: 'PSAT', value: 'Top 99%', when: '8th to 11th grade', detail: 'PSAT: top 99% in 8th grade, top 98% in 9th grade, top 99% in 10th grade, and the 99th percentile and above in 11th grade. PSAT 8/9 score: 1280 out of 1440.' },
  { id: 'map', kind: 'Score', title: 'MAP', value: 'Top 99%', when: '9th and 10th grade', detail: 'MAP: top 98% in 9th grade, top 99% in 10th grade.' },
  { id: 'arrow', kind: 'Program', title: 'Project Arrow', value: 'Since 2nd grade', when: 'IPSD', detail: 'Placed in Project Arrow at Indian Prairie School District 204 (IPSD) since 2nd grade.' },
  { id: 'authors', kind: 'Award', title: 'Young Authors Contest', value: 'Winner', when: '2023', detail: 'Young Authors Contest winner in 2023, Indian Prairie School District 204.' },
  { id: 'minimed', kind: 'Certificate', title: 'Mini-Medical School', value: 'Completed', when: '2021', detail: 'Certificate of completion, 2021.' },
];

export const percentiles = [
  { test: 'PSAT', grade: '8th grade', value: 99 },
  { test: 'PSAT', grade: '9th grade', value: 98 },
  { test: 'PSAT', grade: '10th grade', value: 99 },
  { test: 'PSAT', grade: '11th grade', value: 99 },
  { test: 'MAP', grade: '9th grade', value: 98 },
  { test: 'MAP', grade: '10th grade', value: 99 },
];

/**
 * National Merit recognition from the Grade 11 PSAT (family update, 2026-11-23).
 * Wording is the family's; replace `status` with the exact official term from the score report
 * once verified, and set `certificate` to the image path when the certificate arrives.
 * It is recognition he qualified for, not a scholarship awarded: never word it as one.
 */
export const nationalMerit = {
  title: 'National Merit Recognition',
  test: 'Grade 11 PSAT',
  result: '99th percentile and above',
  status: 'Qualified for National Merit Scholarship recognition',
  /** Set to true once the official score report has been checked. */
  verified: false,
  /** Path of the certificate image under public/assets/certificates, once received. */
  certificate: null as string | null,
};

export interface Volunteering {
  title: string;
  role: string;
  /** Optional details, added as the family confirms them. */
  detail?: string;
  when?: string;
}

/** Volunteering and community work. Add new entries here (details and dates are optional). */
export const volunteering: Volunteering[] = [
  { title: 'TAMA Medical Camp', role: 'Student volunteer' },
  { title: 'Sri Shirdi Sai Temple', role: 'Operations volunteer' },
  { title: 'Peer tutoring', role: 'Tutored 7th and 8th grade students in Math & Science' },
];

/**
 * The summer internship (family update, 2026-11-23). Everything set to null is still to come from
 * the family: fill it in and the site shows it; until then a clearly marked "to be added" label
 * shows instead. Do not invent any of it, and never say he built the whole product.
 */
export const internship = {
  heading: 'Internship & Industry Experience',
  kind: 'Summer internship',
  /** What is confirmed so far. */
  summary: 'A summer internship with a company developing an AI-enabled play mat. The product is now available on the Apple App Store.',
  product: 'AI-enabled play mat',
  company: null as string | null,
  companyUrl: null as string | null,
  productName: null as string | null,
  appStoreUrl: null as string | null,
  period: null as string | null,
  role: null as string | null,
  /** His own contributions, in his words, once confirmed. */
  contributions: [] as string[],
  /** What he learned, once confirmed. */
  learning: [] as string[],
  /** Product image path (public/assets/...), once provided. */
  image: null as string | null,
  /** Certificate image path, once received. */
  certificate: null as string | null,
};

/** The Sports & Fitness Pavilion in the Creative house: his sport and other activities. */
export const pavilion = {
  title: 'Sports & Fitness Pavilion',
  line: 'Swimming, Muay Thai, Science Olympiad and DECA',
  intro: 'Outside the classroom, Shreyas swims, trains in Muay Thai and competes with his school teams. This pavilion brings those activities together.',
  zones: [
    { id: 'swim', title: 'Swimming', org: 'Swim Atlanta', role: 'Senior Team', when: '', line: 'A member of the Swim Atlanta Senior Team. Swimming is one of his activities outside school.' },
    { id: 'muaythai', title: 'Muay Thai', org: 'Martial arts', role: 'Training since 2025', when: 'Since 2025', line: 'He has trained in Muay Thai, a martial art, since 2025.' },
    { id: 'olympiad', title: 'Science Olympiad', org: 'Fulton Science Academy', role: 'Team member', when: '2024 and 2025', line: 'He competed in Science Olympiad for Fulton Science Academy in 2024 and 2025.' },
    { id: 'deca', title: 'DECA', org: 'Fulton Science Academy', role: 'Member', when: '2026', line: 'He joined DECA at Fulton Science Academy in 2026.' },
  ],
} as const;

export const activities = [
  { title: 'Swim Atlanta', role: 'Senior Team member' },
  { title: 'Muay Thai', role: 'Martial arts, since 2025' },
  { title: 'Guitar', role: 'Since 2021 · Atlanta Piano Fortissimo' },
  { title: 'Science Olympiad', role: 'FSA, 2024 and 2025' },
  { title: 'DECA', role: 'FSA, 2026' },
  { title: 'Ice Skating', role: 'Activity' },
  { title: 'Ice Hockey', role: 'Activity' },
  { title: 'Roller Blades', role: 'Activity' },
];

/** Areas of interest (from his resume). */
export const areasOfInterest = ['Biomedical research', 'Artificial intelligence', 'Finance and investing', 'Teaching and mentoring', 'Creative writing'];

/** His path so far, oldest first (years where known, otherwise his grade). */
export const journey = [
  { when: '2nd grade', title: 'Project Arrow', line: 'Placed in the advanced Project Arrow program at Indian Prairie School District 204.' },
  { when: '2021', title: 'Mini-Medical School and guitar', line: 'Certificate of completion from Mini-Medical School; started guitar at Atlanta Piano Fortissimo.' },
  { when: '2023', title: 'Young Authors Contest', line: 'Winner, Indian Prairie School District 204.' },
  { when: '8th grade', title: 'PSAT 8/9: 1280 of 1440', line: 'Top 99% nationwide.' },
  { when: '2024', title: 'Science Olympiad', line: 'Competed for Fulton Science Academy.' },
  { when: '2025', title: 'Principal’s Honors List', line: 'Plus Science Olympiad again and starting Muay Thai.' },
  { when: '2026', title: 'Oncure and the trading app', line: 'Wrote the Oncure research proposal, started building his stock trading application, joined DECA and made the Principal’s Honors List again.' },
  { when: '11th grade', title: 'National Merit recognition', line: 'Grade 11 PSAT: 99th percentile and above. Qualified for National Merit Scholarship recognition.' },
  { when: 'Now', title: 'Junior at Fulton Science Academy', line: 'All Honors and AP courses, PSAT and MAP in the top 98 to 99%, and the 99th percentile and above on the Grade 11 PSAT.' },
];

export const goals = {
  education: 'A bachelor’s degree at a prestigious public or private Ivy League university.',
  career: [
    'Head AI engineering and development at NFC.',
    'Set up and lead a world-class, AI-enabled oncology research lab.',
    'Build an AI-enabled trading platform.',
  ],
};

export const intro = {
  button: 'Discover portfolio',
  /** Gold lettering under the 3D name. */
  subtitle: 'Student researcher',
  headline: 'Curiosity has no limits.',
  lead: confirmed(
    'A junior at Fulton Science Academy exploring computer science, artificial intelligence and FinTech, with research interests in AI for cancer research and AI-enabled trading.',
  ),
  /** Proof line under the hero button. Confirmed facts only. */
  proof: ['National Merit recognition (Grade 11 PSAT)', 'College Board National Recognition Program', 'Principal’s Honors List 2025 · 2026'],
};

export interface Cluster {
  id: string;
  /** Menu entry, after the reference's "CLIENT — PROJECT" list. */
  menu: string;
  title: string;
  status?: string;
  body: Copy[];
  link?: { label: string; href: string };
}

export const clusters: Cluster[] = [
  {
    id: 'about',
    menu: 'About — Who I am',
    title: 'Hello, I’m Shreyas',
    body: [
      confirmed('A junior at Fulton Science Academy in Alpharetta, Georgia.'),
      draft(
        'An independent researcher, an app builder and a peer tutor who loves computer science, artificial intelligence and FinTech, and learns by asking why and then building something to find out.',
      ),
      placeholder('A short personal introduction and philosophy, in Shreyas’s own words.'),
    ],
  },
  {
    id: 'oncure',
    menu: 'Research — Oncure',
    title: 'Oncure: AI-guided nanobot cancer therapy',
    status: 'Concept',
    body: [
      draft(
        'A research concept exploring how nanobots guided by artificial intelligence could deliver cancer therapy directly to tumour cells while sparing healthy tissue.',
      ),
      draft(
        'It starts from real problems: cancer is a leading cause of death, treatment is expensive, side effects are severe, and the mental-health toll is heavy.',
      ),
      placeholder('Objectives, the five-step workflow, findings and charts from the Oncure proposal.'),
    ],
    link: { label: 'Read the Oncure page', href: '/research/oncure' },
  },
  {
    id: 'science',
    menu: 'Science — Medicine & biology',
    title: 'Science & medicine',
    body: [
      confirmed('Mini-Medical School, 2021: certificate of completion.'),
      confirmed('Research interests: AI in oncology and an AI-enabled trading platform.'),
      confirmed('Student volunteer at the TAMA Medical Camp.'),
    ],
  },
  {
    id: 'stocks',
    menu: 'Project — Stock Trading Application',
    title: 'Stock Trading Application',
    status: 'Concept',
    body: [
      confirmed(stockApp.summary),
      confirmed(stockApp.simple),
    ],
    link: { label: 'See the project page', href: '/projects/stock-trading-app' },
  },
  {
    id: 'achievements',
    menu: 'Achievements — Scores & awards',
    title: 'Achievements',
    body: [
      confirmed('College Board National Recognition Program award recipient.'),
      confirmed('Principal’s Honors List at Fulton Science Academy, 2025 and 2026.'),
      confirmed('PSAT: top 99% (8th grade), top 98% (9th), top 99% (10th), and the 99th percentile and above in 11th grade, qualifying for National Merit Scholarship recognition. PSAT 8/9: 1280 out of 1440.'),
      confirmed('MAP: top 98% (9th grade), top 99% (10th).'),
      confirmed('Project Arrow at Indian Prairie School District 204 since 2nd grade.'),
    ],
  },
  {
    id: 'writing',
    menu: 'Writing — Young Authors',
    title: 'Writing',
    body: [
      confirmed('Young Authors Contest, 2023: winner (Indian Prairie School District 204).'),
      confirmed('English Literature Honors.'),
    ],
  },
  {
    id: 'schools',
    menu: 'Journey — Schools',
    title: 'Schools & journey',
    body: [
      confirmed('Nancy Young Elementary → Francis Granger Middle School → Fulton Science Academy (junior, now).'),
      confirmed('Courses include AP Computer Science Principles, AP Computer Science A, AP Biology, AP Chemistry and AP Physics C.'),
    ],
  },
  {
    id: 'tutoring',
    menu: 'Teaching — Peer tutoring',
    title: 'Peer tutoring',
    body: [
      confirmed('Tutored 7th and 8th grade students in Math and Science, one to one and in small groups.'),
      confirmed('Teaches with visual aids and step-by-step explanations.'),
    ],
  },
  {
    id: 'interests',
    menu: 'Interests — Fields of curiosity',
    title: 'Fields of curiosity',
    body: [
      confirmed('Computer Science, Artificial Intelligence, and Business and FinTech.'),
      confirmed('Outside class: Swim Atlanta Senior Team, Muay Thai, guitar, Science Olympiad and DECA.'),
    ],
  },
  {
    id: 'contact',
    menu: 'Contact — Say hello',
    title: 'Get in touch',
    body: [
      confirmed(
        'Teachers, researchers, mentors and admissions teams are welcome to get in touch through the contact form.',
      ),
      confirmed('Messages go to a family-monitored inbox; no personal contact details are published here.'),
    ],
    link: { label: 'Open the contact form', href: '/contact' },
  },
];

export const interests = [
  'Computer Science',
  'Artificial Intelligence',
  'Business & FinTech',
  'Oncology research',
  'Mathematics',
  'Science',
  'Writing',
  'Innovation',
];

export const ending = {
  title: 'Thanks for visiting',
  subtitle: 'Every great discovery starts with curiosity',
  note: 'Want to reach Shreyas? Use the contact form — it goes to a family inbox.',
};

/** Headline figures for the Classic and Studio portfolios. */
export interface Stat {
  value: string;
  suffix?: string;
  label: string;
  /** Set when the figure still needs the family's confirmation; shown as a "to confirm" tag. */
  confirm?: string;
}

export const stats: Stat[] = [
  { value: '99', suffix: 'th', label: 'PSAT percentile' },
  { value: '99', suffix: 'th', label: 'MAP percentile' },
  { value: '2', label: 'Years on the Principal’s Honors List' },
  { value: '1280', suffix: '/1440', label: 'PSAT 8/9 score' },
];

/** Schools in order, oldest first. */
export const schools = [
  { name: 'Nancy Young Elementary', level: 'Elementary school' },
  { name: 'Francis Granger Middle School', level: 'Middle school' },
  { name: 'Fulton Science Academy', level: 'High school · junior, now' },
];

/** Plain questions and answers built from the confirmed facts above. */
export const faq = [
  {
    q: 'Who is Shreyas?',
    a: 'A junior at Fulton Science Academy in Alpharetta, Georgia, interested in computer science, artificial intelligence and FinTech.',
  },
  {
    q: 'What is Oncure?',
    a: 'A research concept by Shreyas for AI-guided nanobot cancer therapy, aimed at treating cancer cells while sparing healthy tissue.',
  },
  {
    q: 'What is his Stock Trading Application?',
    a: 'A beginner-friendly stock trading website, welcoming to veterans too, that uses an AI model, algorithms and real-world data to suggest how much of a stock to buy, when to buy it and when to sell, shown right next to the stock graph.',
  },
  {
    q: 'What has he achieved?',
    a: 'He qualified for National Merit Scholarship recognition with his Grade 11 PSAT (99th percentile and above). He also has the College Board National Recognition Program award, the Principal’s Honors List in 2025 and 2026, PSAT and MAP results in the top 98% to 99%, Project Arrow since 2nd grade, and the Young Authors Contest in 2023.',
  },
  {
    q: 'What does he do outside class?',
    a: 'He swims with the Swim Atlanta Senior Team, trains in Muay Thai, plays guitar, and competes in Science Olympiad and DECA. He is an operations volunteer at the Sri Shirdi Sai Temple and a student volunteer at the TAMA Medical Camp.',
  },
  {
    q: 'Has he done an internship?',
    a: 'Yes. A summer internship with a company developing an AI-enabled play mat, which is now available on the Apple App Store. More details are coming soon.',
  },
  {
    q: 'Does Shreyas tutor other students?',
    a: 'Yes. He has tutored 7th and 8th grade students in Math and Science, using visual aids and step-by-step explanations.',
  },
  {
    q: 'What are his goals?',
    a: 'A bachelor’s degree at a top public or Ivy League university; then to head AI engineering and development at NFC, set up a world-class AI-enabled oncology research lab and build an AI-enabled trading platform.',
  },
  {
    q: 'How do I get in touch?',
    a: 'Use the contact form. Messages go to a family-monitored inbox, and no personal contact details are published on this site.',
  },
];

export const findCluster = (id: string) => clusters.find((c) => c.id === id);

/**
 * Oncure, from Shreyas's research proposal and essay. A conceptual research proposal: not an
 * existing or clinically validated treatment. Keep that framing wherever this is shown.
 */
export const oncure = {
  name: 'Oncure',
  tagline: 'AI-powered nanobot cancer treatment · a research concept',
  pitch:
    'Oncure envisions a new generation of AI-guided, nanotechnology-enabled cancer therapies designed to detect and target malignant cells with greater precision, reduced treatment burden and improved accessibility.',
  summary:
    'A proposed cancer treatment system that combines artificial intelligence, nanorobotics and targeted antibody therapy to detect and destroy cancer cells while reducing treatment time, cost and side effects. Microscopic robots in the bloodstream would find cancer cells, report to an AI system, and deliver synthetic antibodies that trigger programmed cell death (apoptosis).',
  vision: 'An affordable, rapid, minimally invasive cancer treatment accessible worldwide.',
  disclaimer: 'Oncure is a conceptual research proposal, not an existing or clinically validated cancer treatment.',
  video: `${import.meta.env.BASE_URL}assets/videos/oncure.mp4`,
  features: [
    { title: 'AI-powered detection', line: 'AI analyses what the nanobots collect to find possible cancer cells.' },
    { title: 'Nanobot technology', line: 'Microscopic robots would travel through the bloodstream to locate cancer.' },
    { title: 'Early and late stage', line: 'Intended to identify cancer at different stages.' },
    { title: 'Targeted delivery', line: 'Nanobots would release therapeutic antibodies at the cancer cells.' },
    { title: 'Apoptosis activation', line: 'Antibodies would activate cell-death pathways such as Fas (CD95) or DR5.' },
    { title: 'Human verification', line: 'Doctors would confirm what the AI finds before any treatment.' },
    { title: 'Shorter treatment', line: 'A goal of hours rather than months, which is not yet proven.' },
    { title: 'Lower cost', line: 'Designed to reduce the financial burden of cancer treatment.' },
    { title: 'Fewer side effects', line: 'Precise targeting aims to protect healthy cells.' },
    { title: 'Universal treatment vision', line: 'Aspires to address multiple cancer types using a common technology platform.' },
  ],
  /** How the proposal suggests presenting Oncure first. */
  positioning: 'For a research proposal or investor presentation, Oncure is best positioned first as an AI-assisted targeted cancer drug-delivery research platform, rather than as a universal cancer cure.',
  steps: [
    { title: 'Nanobot injection', line: 'Microscopic robots enter the bloodstream.' },
    { title: 'Cancer detection', line: 'Nanobots scan tissue and send what they find to the AI.' },
    { title: 'AI analysis and human check', line: 'The AI flags suspicious cells; a clinician verifies them.' },
    { title: 'Targeted antibody release', line: 'Nanobots deliver synthetic antibodies to the chosen cancer cells.' },
    { title: 'Apoptosis', line: 'The cancer cells are triggered to die, sparing healthy tissue.' },
  ],
  problems: [
    { title: 'High mortality', line: 'About 20 million people are diagnosed with cancer each year and nearly 10 million die from it (WHO, IARC / GLOBOCAN).' },
    { title: 'Expensive treatment', line: 'Late-stage chemotherapy can cost more than $100,000 out of pocket, even with insurance (American Cancer Society).' },
    { title: 'Long treatment', line: 'A standard chemotherapy regimen for late-stage lung cancer can take six to eight months.' },
    { title: 'Severe side effects', line: 'Treatment can bring immunosuppression and heavy strain on organs (National Cancer Institute).' },
    { title: 'Emotional toll', line: 'About 15–25% of people with cancer develop clinical depression, and caregivers often feel as much distress (NIH).' },
    { title: 'Limited access', line: 'Advanced treatments are out of reach or unaffordable in many places.' },
  ],
  challenges: [
    { title: 'Miniaturisation', line: 'Fitting sensors, payload, communication and control at microscopic scale.' },
    { title: 'Power', line: 'A safe energy source, since nanobots are too small for batteries.' },
    { title: 'Telling cells apart', line: 'Separating cancer cells from healthy ones with very high accuracy.' },
    { title: 'AI reliability', line: 'Training the AI to never miss cancer cells while avoiding false alarms.' },
    { title: 'Communication', line: 'Sending data out through living tissue.' },
    { title: 'Targeted delivery', line: 'Making sure antibodies reach the cancer cells without harming healthy tissue.' },
    { title: 'Biological safety', line: 'Immune response, toxicity and how the nanobots leave the body.' },
    { title: 'Clinical validation', line: 'Proving safety and effectiveness in lab research and human trials.' },
    { title: 'Funding and team', line: 'Investment and a dedicated multidisciplinary team.' },
  ],
  evidence: [
    'UC Berkeley built a battery-free flying robot only about 1 cm wide (UC Berkeley News).',
    'The University of Pennsylvania and the University of Michigan made a controllable robot of about 200–300 micrometres, smaller than a grain of salt (ScienceDaily).',
  ],
  roadmap: [
    { title: 'Feasibility research', line: 'Test the biological and engineering assumptions.' },
    { title: 'Nanobot prototype', line: 'A miniature platform for controlled movement or delivery.' },
    { title: 'Power and communication', line: 'Biocompatible energy and data transfer.' },
    { title: 'AI detection model', line: 'Build and evaluate cancer recognition on validated datasets.' },
    { title: 'Antibody research', line: 'Targeted activation of cancer-cell apoptosis.' },
    { title: 'Preclinical testing', line: 'Safety and effectiveness in the lab.' },
    { title: 'Clinical development', line: 'Regulatory review and trials, if the evidence supports it.' },
  ],
  /** What each nanobot would carry, as first proposed (see the considerations below). */
  parts: ['A power system', 'A scanner', 'A light', 'Synthetic antibodies', 'A tiny Wi-Fi microcontroller (ESP8266 was proposed)'],
  /** The story behind Oncure, in his words (statistics as the considerations below put them). */
  story: [
    'Cancer is a ravenous disease. There are many treatment options today, but they all come with a catch. Around the world about 20 million people are diagnosed with cancer every year and nearly 10 million die from it (WHO, IARC / GLOBOCAN). Treatment can take years and is very expensive: a standard chemotherapy regimen for late-stage lung cancer can span six to eight months and cost over $100,000 out of pocket, even with health insurance (American Cancer Society). Along the way patients suffer serious side effects, such as immunosuppression and heavy organ strain (National Cancer Institute).',
    'The impact reaches beyond the body. About 15–25% of people with cancer develop clinical depression, and families and caregivers often show similar or even greater distress (NIH / PubMed). Many of the families affected are low or middle income (World Bank), so a $100,000 bill is a huge blow to their financial security (KFF). The mortality, the cost and the psychological toll are too much for families to carry.',
    'This is where Oncure comes in: a treatment designed to take as little time and money as possible. It works in two parts, the nanobots and the AI agent. Many nanobots are sent through the bloodstream in a drug-like injection. They scan the body and relay what they find to the AI, whose detection system identifies cancer, early or late stage. A human verifies the cancer, so that no unnecessary cell death takes place. Each nanobot then attaches to the nearest cancer cell and releases its synthetic antibodies, which bind to death receptors such as Fas (CD95) or DR5 (UC Davis Health) and trigger a chain reaction of apoptosis in the cancer cells (Journal of Cellular and Molecular Medicine).',
    'Oncure is an ambitious and optimistic outlook on what could be, and it comes with many limitations. The technology does not exist yet, though it has grounds to. Robots keep getting smaller, and that progress suggests that, with extensive research, something like Oncure could one day be built. Many steps lie ahead: a power source the nanobots can use, an AI agent trained never to miss cancer cells, and a simpler way to scan. All of it needs funding, time, effort and a dedicated team.',
  ],
  /** Points the proposal must refine before it goes to researchers or investors. */
  considerations: [
    { title: 'Universal cancer cure', line: 'Different cancers have distinct biology. A single treatment effective against every cancer type has not been demonstrated.' },
    { title: 'Treatment within hours', line: 'There is no evidence yet that nanobots could eliminate cancer within hours.' },
    { title: 'ESP8266 microcontroller', line: 'The ESP8266 is not a nanoscale part and could not fit inside bloodstream nanobots.' },
    { title: 'Reaching every tumour', line: 'Injected nanobots would not automatically travel through the nervous system or reach all tumours.' },
    { title: 'Apoptosis mechanism', line: 'Fas and DR5 are real cell-death targets, but triggering them safely and selectively remains hard.' },
    { title: 'Reading the statistics', line: 'About 20 million cases and 10 million deaths a year are population estimates, not proof that half of treated patients die. Costs and income figures need stronger sources.' },
  ],
  assessment:
    'Oncure presents an ambitious long-term research vision combining AI, nanotechnology and targeted cancer therapy. Its strongest opportunity is precision oncology, but major scientific breakthroughs and clinical validation would be needed before it could become a practical treatment. It is best positioned first as an AI-assisted targeted drug-delivery research platform, not as a universal cure.',
  values: [
    { title: 'Precision', line: 'Target cancer cells, spare healthy tissue.' },
    { title: 'Speed', line: 'Research ways to shorten treatment.' },
    { title: 'Affordability', line: 'Make advanced therapy financially accessible.' },
    { title: 'Well-being', line: 'Reduce physical, emotional and financial suffering.' },
  ],
};

/** From Shreyas's résumé (contact details and home address deliberately left out). */
export const resume = {
  summary:
    'An outgoing student who communicates easily with people of every age. He has tutored his peers one on one and in groups, at lunch and after school, helping them understand difficult concepts and build better study habits. He works quickly and efficiently, and has a strong affinity for teaching younger children in simple terms.',
  tutoring: [
    'Helped fellow students prepare for quizzes and exams.',
    'Assisted with homework and gave supplementary instruction.',
    'Explained difficult concepts with visual aids, diagrams and step-by-step explanations.',
    'Gave targeted help in mathematics and science that improved grades.',
    'Ran small-group sessions for peer-to-peer learning.',
    'Gave constructive feedback on writing and critical thinking.',
  ],
  skills: [
    'Verbal and written communication',
    'Advanced mathematics',
    'Advanced literature',
    'Academic coaching',
    'Goal setting',
    'Leadership',
    'Presentation skills',
    'Essay writing',
    'Tutoring coordination',
    'Fast, efficient work',
    'Adaptability',
    'Multitasking',
  ],
  highlights: [
    'Advanced courses throughout: Project Arrow in middle school, all honours and AP in high school.',
    'Mathematics through AP Pre-calculus.',
    'Top 1% scores in standardised testing for mathematics and English language arts.',
    'PSAT 8/9: 1280 out of 1440 in 8th grade.',
    'Young Authors Contest winner, Indian Prairie School District 204, 2023.',
    'Mini-Medical School certificate, July 2021.',
  ],
};

/** From the updated resume (public/assets/Shreyas_Ballari_Resume.pdf). */
export const resumeExtra = {
  headline: 'High School Student · Independent Researcher (AI & Biomedical) · Peer Tutor',
  scores: [
    { value: '1280 / 1440', label: 'PSAT 8/9 in 8th grade' },
    { value: 'Top 1%', label: 'MAP and i-Ready in Mathematics and English Language Arts' },
  ],
  skills: [
    { group: 'Academic', items: ['Advanced Mathematics (AP Precalculus)', 'Advanced Literature (Honors)', 'Essay writing', 'Research writing', 'Scientific source review and citation'] },
    { group: 'Research & technology', items: ['Artificial Intelligence concepts', 'Nanotechnology and biomedical research', 'App development', 'Online tools', 'Fast typing'] },
    { group: 'Teaching & leadership', items: ['Peer tutoring', 'Academic coaching', 'Homework assistance', 'Goal setting', 'Session coordination', 'Leadership'] },
    { group: 'Communication', items: ['Verbal and written communication', 'Presentation skills', 'Confident with peers, younger students and adults'] },
    { group: 'Work style', items: ['Strong work ethic', 'High efficiency', 'Multitasking', 'Adaptability', 'Reliability'] },
  ],
  interests: ['Biomedical research', 'Artificial Intelligence', 'Finance and investing', 'Teaching and mentoring', 'Creative writing'],
};
