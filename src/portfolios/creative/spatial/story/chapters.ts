import type { ComponentType } from 'react';
import { ChartLineUp, ChatsCircle, Dna, GameController, Guitar, SquaresFour, Trophy, type IconProps } from '@phosphor-icons/react';

/**
 * The apps of Shreyas's spatial home (the rail on the left, the Home View, voice and the guided
 * tour all use this list). Each app has the house station it belongs to (used by the house tour)
 * and what the narrator says when you open it. Every fact comes from the family's brief (content/portfolio.ts).
 */

export type StationId = 'entry' | 'living' | 'sofa' | 'bedroom' | 'study' | 'lab' | 'gallery' | 'kitchen' | 'music' | 'garden' | 'return';

export interface Chapter {
  id: string;
  title: string;
  /** One line under the title. */
  line: string;
  station: StationId;
  icon: ComponentType<IconProps>;
  /** App tint (Home View icon and accents). */
  tint: string;
  say: string;
  voice: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'home',
    title: 'Dashboard',
    line: 'Everything about Shreyas, at a glance',
    station: 'living',
    icon: SquaresFour,
    tint: '#5b7cfa',
    say: "Welcome to Shreyas's world. This is his dashboard: his research, his app, his awards and his activities. Drag a card onto the pinboard, open any story, or ask the AI about him.",
    voice: ['dashboard', 'home', 'menu', 'start', 'living room', 'feed'],
  },
  {
    id: 'oncure',
    title: 'Oncure',
    line: 'Research concept · AI-guided nanobots',
    station: 'lab',
    icon: Dna,
    tint: '#e0466e',
    say: 'This is his research concept, Oncure. The idea is to explore how nanobots guided by artificial intelligence could deliver cancer therapy straight to tumour cells, while sparing healthy tissue. It grew from real problems: treatment is expensive, side effects are hard, and the toll on patients is heavy. Oncure is a concept, not a tested treatment.',
    voice: ['oncure', 'research', 'lab', 'laboratory', 'oncology', 'cancer', 'nanobots'],
  },
  {
    id: 'finance',
    title: 'Stock Trading App',
    line: 'Stock Trading Application · concept',
    station: 'lab',
    icon: ChartLineUp,
    tint: '#22a06b',
    say: 'Shreyas is building a stock trading application. The idea is a beginner friendly website where an AI model uses real world data to suggest how much of a stock to buy, when to buy it, and when to sell. Its suggestions are hypothetical, not financial advice.',
    voice: ['finance', 'finance app', 'fintech', 'trading', 'stock', 'stock app', 'trading app'],
  },
  {
    id: 'awards',
    title: 'Awards',
    line: 'Certificates, honors, trophies and achievements',
    station: 'gallery',
    icon: Trophy,
    tint: '#d4a43a',
    say: "These are his awards. He has been in Project Arrow in his school district since second grade, was named to the Principal's Honors List at Fulton Science Academy in 2025 and 2026, was in the top 99 percent on the PSAT in eighth and tenth grade and the top 98 percent in ninth, the top 98 and 99 percent on MAP, received the College Board National Recognition Program award, won the Young Authors Contest in 2023 and completed Mini Medical School in 2021.",
    voice: ['awards', 'award', 'achievements', 'achievement', 'trophies', 'trophy', 'gallery', 'honors', 'certificates', 'rewards'],
  },
  {
    id: 'chat',
    title: 'AI Chat',
    line: 'Ask anything about Shreyas',
    station: 'sofa',
    icon: ChatsCircle,
    tint: '#9b6bff',
    say: 'Ask me anything about Shreyas: his projects, his research, his school, his awards, his timeline or his goals. Type your question, or say it.',
    voice: ['ai chat', 'chat', 'ask', 'assistant', 'questions'],
  },
  {
    id: 'games',
    title: 'Games',
    line: 'Four games from his story',
    station: 'return',
    icon: GameController,
    tint: '#f28c28',
    say: "It's your turn. Four games, each from a part of his story: Cell Defender from Oncure, Market Sense from his trading app, String Rhythm from his guitar, and Award Match from his awards.",
    voice: ['games', 'game', 'play games', 'cell defender', 'market sense', 'string rhythm', 'award match', 'fun'],
  },
  {
    id: 'activities',
    title: 'Activities',
    line: 'Guitar, songs, sports and giving back',
    station: 'music',
    icon: Guitar,
    tint: '#3bb2d6',
    say: 'Beyond class. Shreyas has played guitar since 2021, at Atlanta Piano Fortissimo, so press play for an original guitar piece generated in your browser. He swims with the Swim Atlanta Senior Team, trains in Muay Thai, competed in Science Olympiad and joined DECA, volunteers at the TAMA Medical Camp and the Sri Shirdi Sai Temple, and tutors younger students in math and science.',
    voice: ['activities', 'guitar', 'music', 'songs', 'song', 'sports', 'swimming', 'muay thai', 'volunteering', 'community', 'play music'],
  },
];

export const chapterIndex = (id: string) => CHAPTERS.findIndex((c) => c.id === id);
