import { achievements, activities, courses, goals, internship, languages, nationalMerit, oncure, pavilion, percentiles, profile, resume, stockApp, volunteering } from '@/content/portfolio';
import { STORIES, type Card } from './media';

/**
 * The AI chat's knowledge: answers questions about Shreyas using ONLY the facts in his portfolio
 * (content/portfolio.ts). It reads the question, finds the topic it is about (with synonyms and
 * a little fuzziness), and composes an answer with cards and follow-up suggestions. It never
 * guesses: when a question is outside what the portfolio says, it says so and suggests what it
 * can answer. (Runs entirely in the browser; a hosted AI model can be wired in later behind a
 * server, never with a key in the page.)
 */

export interface Answer {
  text: string;
  cards?: Card[];
  chips?: string[];
  /** An app to offer opening. */
  open?: { app: string; label: string };
}

const story = (...ids: string[]) => ids.map((id) => STORIES.find((s) => s.id === id)).filter((c): c is Card => !!c);
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

interface Topic {
  id: string;
  words: string[];
  answer: () => Answer;
}

const TIMELINE = [
  '2nd grade onwards: Project Arrow, Indian Prairie School District 204',
  '2021: started guitar at Atlanta Piano Fortissimo; completed Mini-Medical School',
  '2023: won the Young Authors Contest (District 204)',
  '2024: Science Olympiad at FSA',
  '2025: Science Olympiad again; Principal’s Honors List at FSA; started Muay Thai',
  '2026: Principal’s Honors List again; DECA at FSA; a summer internship with a company developing an AI-enabled play mat',
  '11th grade: Grade 11 PSAT in the 99th percentile and above; qualified for National Merit Scholarship recognition',
  'Now: a junior at Fulton Science Academy, researching AI in oncology and building a stock trading application',
];

const TOPICS: Topic[] = [
  {
    id: 'bio',
    words: ['who', 'him', 'introduce', 'bio', 'himself', 'person', 'background', 'overview', 'summary', 'describe'],
    answer: () => ({
      text: `${profile.name} is a ${profile.grade.toLowerCase()} at ${profile.school} in ${profile.schoolTown}. He is drawn to computer science, artificial intelligence, business and FinTech. He is exploring AI in cancer research through his concept Oncure, and he is building a stock trading application for beginners.`,
      cards: story('profile', 'oncure', 'finance'),
      chips: ['What does he study?', 'Tell me about Oncure', 'What are his awards?', 'Show his timeline'],
      open: { app: 'profile', label: 'Open his profile' },
    }),
  },
  {
    id: 'school',
    words: ['school', 'study', 'studies', 'education', 'grade', 'class', 'classes', 'course', 'courses', 'subject', 'subjects', 'ap', 'fsa', 'fulton', 'academy', 'junior', 'learn'],
    answer: () => ({
      text: `He is a ${profile.grade.toLowerCase()} at ${profile.school} (${profile.schoolShort}) in ${profile.schoolTown}. His courses: ${list(courses)}.`,
      cards: story('school', 'code'),
      chips: ['What languages does he code in?', 'What are his test scores?', 'What are his goals?'],
    }),
  },
  {
    id: 'code',
    words: ['code', 'coding', 'program', 'programming', 'language', 'languages', 'javascript', 'python', 'java', 'developer', 'computer science', 'software'],
    answer: () => ({
      text: `He writes code in ${list(languages)}, and takes AP Computer Science Principles, AP Computer Science A and Artificial Intelligence at school. He is putting it to work in a stock trading application.`,
      cards: story('code', 'finance'),
      chips: ['Tell me about the trading app', 'What does he study?'],
    }),
  },
  {
    id: 'oncure',
    words: ['oncure', 'research', 'cancer', 'oncology', 'nanobot', 'nanobots', 'tumour', 'tumor', 'medical', 'medicine', 'therapy', 'science', 'lab'],
    answer: () => ({
      text: `Oncure is his research proposal for an AI-powered nanobot cancer treatment. ${oncure.summary} The vision: ${oncure.vision.charAt(0).toLowerCase()}${oncure.vision.slice(1)} ${oncure.disclaimer}`,
      cards: story('oncure', 'games'),
      chips: ['How would Oncure work?', 'What problem does Oncure solve?', 'What are the challenges?', 'What are the next steps?'],
      open: { app: 'oncure', label: 'Open Oncure' },
    }),
  },
  {
    id: 'oncure-steps',
    words: ['how', 'work', 'works', 'steps', 'step', 'process', 'workflow', 'antibody', 'antibodies', 'apoptosis', 'inject', 'injection', 'detect', 'detection'],
    answer: () => ({
      text: `How Oncure is intended to work, in five steps: ${oncure.steps.map((s, i) => `${i + 1}) ${s.title}: ${s.line.charAt(0).toLowerCase()}${s.line.slice(1)}`).join(' ')} The antibodies would bind to death receptors such as Fas (CD95) or DR5. This is a conceptual workflow; it has not been demonstrated.`,
      cards: story('oncure'),
      chips: ['What problem does Oncure solve?', 'What are the challenges?'],
      open: { app: 'oncure', label: 'Watch the Oncure video' },
    }),
  },
  {
    id: 'oncure-problem',
    words: ['problem', 'problems', 'why', 'statistics', 'stats', 'deaths', 'mortality', 'cost', 'expensive', 'chemotherapy', 'chemo', 'depression', 'solve', 'need'],
    answer: () => ({
      text: `From his research essay: ${oncure.problems.map((p) => p.line).join(' ')}`,
      cards: story('oncure'),
      chips: ['How would Oncure work?', 'What are the challenges?'],
      open: { app: 'oncure', label: 'Open Oncure' },
    }),
  },
  {
    id: 'oncure-challenges',
    words: ['challenge', 'challenges', 'limitation', 'limitations', 'possible', 'feasible', 'real', 'exist', 'power', 'battery', 'risk', 'risks', 'hard'],
    answer: () => ({
      text: `He is clear that the technology does not exist yet. What would need solving: ${oncure.challenges.map((c) => c.title.toLowerCase()).join(', ')}. Robots are shrinking fast, though: ${oncure.evidence.join(' ')}`,
      cards: story('oncure'),
      chips: ['What are the next steps?', 'How would Oncure work?'],
    }),
  },
  {
    id: 'oncure-roadmap',
    words: ['next', 'future', 'roadmap', 'plan', 'plans', 'prototype', 'trial', 'trials', 'funding'],
    answer: () => ({
      text: `The road ahead for Oncure, in order: ${oncure.roadmap.map((r) => r.title.toLowerCase()).join(', ')}. ${oncure.pitch}`,
      cards: story('oncure'),
      chips: ['What are his goals?', 'What are the challenges?'],
    }),
  },
  {
    id: 'tutoring',
    words: ['tutor', 'tutoring', 'tutored', 'teach', 'teaching', 'peer', 'experience', 'work', 'job', 'help', 'helped', 'students'],
    answer: () => ({
      text: `${resume.summary} As a peer tutor he: ${resume.tutoring.map((t) => t.charAt(0).toLowerCase() + t.slice(1).replace(/\.$/, '')).join('; ')}.`,
      chips: ['What are his skills?', 'How does he give back?'],
    }),
  },
  {
    id: 'skills',
    words: ['skill', 'skills', 'strength', 'strengths', 'good', 'abilities', 'personality', 'qualities', 'resume'],
    answer: () => ({
      text: `His skills include ${list(resume.skills.map((x) => x.toLowerCase()))}. He codes in ${list(languages)}. Highlights: ${resume.highlights.join(' ')}`,
      cards: story('code', 'school'),
      chips: ['Has he tutored?', 'What does he study?'],
    }),
  },
  {
    id: 'stock-features',
    words: ['features', 'feature', 'dashboard', 'calculator', 'calculators', 'holdings', 'orders', 'buy', 'sell', 'candlestick'],
    answer: () => ({
      text: `What the trading app will have: ${stockApp.features.map((f) => `${f.title.toLowerCase()} (${f.line.charAt(0).toLowerCase()}${f.line.slice(1).replace(/\.$/, '')})`).join('; ')}. Its suggestions are hypothetical, not financial advice.`,
      cards: story('finance'),
      open: { app: 'finance', label: 'Open the trading app' },
    }),
  },
  {
    id: 'finance',
    words: ['trading', 'stock', 'stocks', 'finance', 'financial', 'fintech', 'app', 'market', 'invest', 'investing', 'business', 'money', 'project', 'projects', 'build', 'building'],
    answer: () => ({
      text: `${stockApp.summary} Features include ${list(stockApp.features.slice(0, 4).map((f) => f.title.toLowerCase()))}. Its suggestions are hypothetical, not financial advice.`,
      cards: story('finance', 'code'),
      chips: ['Who is it for?', 'Tell me about Oncure', 'What does he study?'],
      open: { app: 'finance', label: 'Open the Finance App' },
    }),
  },
  {
    id: 'forwhom',
    words: ['who is it for', 'for whom', 'beginners', 'users', 'audience'],
    answer: () => ({ text: `The trading app is for ${stockApp.forWhom.charAt(0).toLowerCase()}${stockApp.forWhom.slice(1)}`, cards: story('finance'), chips: ['Tell me about Oncure'] }),
  },
  {
    id: 'awards',
    words: ['award', 'awards', 'achievement', 'achievements', 'honor', 'honors', 'honours', 'prize', 'won', 'win', 'recognition', 'certificate', 'certificates', 'trophy', 'trophies', 'accomplishments', 'college board', 'arrow', 'young authors', 'mini medical'],
    answer: () => ({
      text: `${achievements.map((a) => a.detail).join(' ')}`,
      cards: story('awards'),
      chips: ['What are his test scores?', 'Show his timeline'],
      open: { app: 'awards', label: 'Open Awards' },
    }),
  },
  {
    id: 'merit',
    words: ['national merit', 'merit', 'nmsc', 'scholarship', 'grade 11', '11th grade', 'junior psat', 'psat 11', 'nmsqt'],
    answer: () => ({
      text: `${nationalMerit.title}: on the ${nationalMerit.test} he placed in the ${nationalMerit.result}. ${nationalMerit.status}. (This is recognition he qualified for; the portfolio does not say a scholarship has been awarded.) Earlier PSAT results: top 99% in 8th grade, top 98% in 9th and top 99% in 10th.`,
      cards: story('awards'),
      chips: ['What are his other awards?', 'What are his test scores?'],
      open: { app: 'awards', label: 'Open Awards' },
    }),
  },
  {
    id: 'internship',
    words: ['internship', 'intern', 'interned', 'play mat', 'playmat', 'industry', 'job', 'work experience', 'company', 'app store', 'summer'],
    answer: () => ({
      text: `${internship.summary}${internship.company ? ` The company: ${internship.company}.` : ' The company name, his role and his contributions will be added once confirmed.'}`,
      chips: ['What are his projects?', 'What are his goals?'],
      open: { app: 'internship', label: 'Open the internship' },
    }),
  },
  {
    id: 'pavilion',
    words: ['pavilion', 'sports pavilion', 'fitness', 'gym', 'pool', 'swim atlanta', 'senior team', 'training'],
    answer: () => ({
      text: `${pavilion.intro} ${pavilion.zones.map((z) => z.line).join(' ')}`,
      chips: ['Does he volunteer?', 'What are his goals?'],
      open: { app: 'pavilion', label: 'Open the Sports & Fitness Pavilion' },
    }),
  },
  {
    id: 'scores',
    words: ['psat', 'map', 'percentile', 'score', 'scores', 'test', 'tests', 'sat', 'exam', 'exams', 'grades', 'gpa'],
    answer: () => ({
      text: `${percentiles.map((p) => (p.test === 'PSAT' && p.grade === '11th grade' ? `PSAT in 11th grade: 99th percentile and above, qualifying for National Merit Scholarship recognition` : `${p.test} in ${p.grade}: top ${p.value}%`)).join('. ')}. His PSAT 8/9 score was 1280 out of 1440. (The portfolio does not list a GPA.)`,
      cards: story('awards'),
      chips: ['What are his awards?', 'What does he study?'],
    }),
  },
  {
    id: 'activities',
    words: ['activities', 'hobby', 'hobbies', 'sport', 'sports', 'swim', 'swimming', 'muay thai', 'martial', 'guitar', 'music', 'instrument', 'olympiad', 'deca', 'free time', 'fun', 'extracurricular', 'extracurriculars', 'clubs'],
    answer: () => ({
      text: `${activities.map((a) => `${a.title}: ${a.role}`).join('. ')}. Swimming, Muay Thai, Science Olympiad and DECA are together in the Sports & Fitness Pavilion in his 3D home.`,
      cards: story('guitar', 'games'),
      chips: ['Play his guitar song', 'Does he volunteer?', 'What are his goals?'],
      open: { app: 'activities', label: 'Open Activities' },
    }),
  },
  {
    id: 'volunteer',
    words: ['volunteer', 'volunteering', 'community', 'service', 'tutor', 'tutoring', 'temple', 'tama', 'help', 'giving back', 'charity'],
    answer: () => ({
      text: `${volunteering.map((v) => `${v.title}: ${v.role}`).join('. ')}.`,
      chips: ['What are his activities?', 'What are his goals?'],
      open: { app: 'activities', label: 'Open Activities' },
    }),
  },
  {
    id: 'goals',
    words: ['goal', 'goals', 'future', 'dream', 'dreams', 'ambition', 'ambitions', 'plan', 'plans', 'college', 'university', 'career', 'nfc', 'want to be', 'aspire'],
    answer: () => ({
      text: `His goals: ${goals.education} Then to ${list(goals.career.map((g) => g.replace(/\.$/, '').charAt(0).toLowerCase() + g.replace(/\.$/, '').slice(1)))}. These are goals for the future, not current positions.`,
      cards: story('oncure', 'finance'),
      chips: ['Tell me about Oncure', 'Show his timeline'],
    }),
  },
  {
    id: 'timeline',
    words: ['timeline', 'journey', 'history', 'when', 'year', 'years', 'since', 'story', 'milestones', 'over time'],
    answer: () => ({ text: TIMELINE.join('\n'), cards: story('awards', 'guitar', 'school'), chips: ['What are his awards?', 'What are his goals?'] }),
  },
  {
    id: 'contact',
    words: ['contact', 'email', 'reach', 'phone', 'message', 'hire', 'connect', 'linkedin', 'get in touch'],
    answer: () => ({ text: 'The best way to reach Shreyas is the contact form on this site; messages go to a family-monitored inbox. The portfolio does not list a public email or phone number.', chips: ['Tell me about him'] }),
  },
  {
    id: 'location',
    words: ['where', 'live', 'lives', 'location', 'city', 'from', 'georgia', 'alpharetta', 'atlanta'],
    answer: () => ({ text: `He goes to school at ${profile.school} in ${profile.schoolTown}.`, chips: ['What does he study?'] }),
  },
  {
    id: 'hello',
    words: ['hi', 'hello', 'hey', 'thanks', 'thank you', 'good morning', 'good evening'],
    answer: () => ({ text: 'Hi! Ask me anything about Shreyas: his research, his projects, his school, his awards, his activities, his timeline or his goals.', chips: SUGGESTIONS.slice(0, 4) }),
  },
];

export const SUGGESTIONS = ['Who is Shreyas?', 'Tell me about Oncure', 'What is his trading app?', 'What are his awards?', 'What does he study?', 'Show his timeline', 'What are his goals?', 'What are his activities?'];

const norm = (s: string) => ` ${s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()} `;

/** Small edit distance, for typos ("oncur", "tradng"). */
function close(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
  let diff = 0;
  for (let i = 0, j = 0; i < a.length || j < b.length; ) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++diff > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return true;
}

export function ask(question: string): Answer {
  const q = norm(question);
  const qWords = q.trim().split(' ');
  let best: { t: Topic; score: number } | null = null;
  for (const t of TOPICS) {
    let score = 0;
    for (const w of t.words) {
      if (q.includes(` ${w} `)) score += w.includes(' ') ? 3 : 2;
      else if (!w.includes(' ') && qWords.some((x) => close(x, w))) score += 1;
    }
    if (score > (best?.score ?? 0)) best = { t, score };
  }
  if (!best || best.score < 1) {
    return {
      text: 'I can only answer from what is in Shreyas’s portfolio, and I don’t have that detail. Try asking about his research, his trading app, his school, his awards, his activities, his timeline or his goals.',
      chips: SUGGESTIONS.slice(0, 5),
    };
  }
  return best.t.answer();
}
