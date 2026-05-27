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

export const SUBJECTS = ['Mathematics', 'Science', 'English', 'History'] as const;
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

