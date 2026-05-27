export type QuizTask = {
  question_type: 'multiple_choice' | 'true_false';
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  xp_reward: number;
};

export type QuizBundle = {
  tasks: QuizTask[];
};

export type ForgePhase = 'input' | 'processing' | 'editor';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export type ClassroomFilter = {
  subject: string;
  grade: string;
  section: string;
};

export type QuizPublishPayload = ClassroomFilter & {
  title: string;
  tasks: QuizTask[];
  level_number?: number | null;
};

export type QuizResponse = QuizPublishPayload & {
  id: number;
  published_at: string;
};

export type TopicPerformance = {
  topic: string;
  accuracy: number;
  status: string;
};

export type AnalyticsSummary = ClassroomFilter & {
  avg_score: number;
  completion_rate: number;
  students_count: number;
  topics: TopicPerformance[];
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  read_count: number;
  created_at: string;
};

export type AnnouncementCreate = {
  title: string;
  body: string;
  priority: AnnouncementPriority;
};

export const SUBJECTS = ['Mathe', 'Sprache', 'Natur', 'Kunst'] as const;
export const GRADES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] as const;
export const SECTIONS = ['Section A', 'Section B', 'Section C'] as const;

export type QuizResultResponse = {
  id: number;
  quiz_id: number;
  quiz_title: string;
  student_name: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
};

export type QuizResultsSummary = {
  quiz_id: number;
  quiz_title: string;
  total_attempts: number;
  average_score: number;
  results: QuizResultResponse[];
};

export const SUBJECT_LEVELS: Record<string, { number: number; title: string }[]> = {
  Mathe: [
    { number: 1, title: 'Zahlen 1-10' },
    { number: 2, title: 'Addition' },
    { number: 3, title: 'Subtraktion' },
    { number: 4, title: 'Multiplikation' },
    { number: 5, title: 'Division' },
    { number: 6, title: 'Brüche' },
    { number: 7, title: 'Geometrie' },
    { number: 8, title: 'Algebra' },
  ],
  Sprache: [
    { number: 1, title: 'Buchstaben A-E' },
    { number: 2, title: 'Buchstaben F-J' },
    { number: 3, title: 'Buchstaben K-O' },
    { number: 4, title: 'Buchstaben P-T' },
    { number: 5, title: 'Buchstaben U-Z' },
  ],
  Natur: [
    { number: 1, title: 'Pflanzen' },
    { number: 2, title: 'Tiere' },
    { number: 3, title: 'Wetter' },
    { number: 4, title: 'Erde & Weltraum' },
    { number: 5, title: 'Ökosysteme' },
  ],
  Kunst: [
    { number: 1, title: 'Grundfarben' },
    { number: 2, title: 'Formen zeichnen' },
    { number: 3, title: 'Muster & Texturen' },
    { number: 4, title: 'Landschaften' },
    { number: 5, title: 'Porträts' },
    { number: 6, title: 'Abstrakte Kunst' },
  ],
};


export type Level = {
  id?: number;
  level_number: number;
  title: string;
  is_unlocked: boolean;
  is_completed: boolean;
  stars: number;
};

export type Subject = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  shadow_color: string;
  level: number;
  levels: Level[];
};

export type SubjectCreate = {
  name: string;
  emoji: string;
  color: string;
  shadow_color: string;
  level: number;
  levels: { title: string; is_unlocked?: boolean; is_completed?: boolean; stars?: number }[];
};


