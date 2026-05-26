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

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';
