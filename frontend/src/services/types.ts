export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  onboarding_completed_at: string | null;
};

export type Admin = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionOptionPayload = {
  text: string;
  is_correct: boolean;
};

/** Corpo completo exigido por POST/PUT /admin/questions (update é full-replace). */
export type QuestionPayload = {
  statement: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  correct_answer?: string | null;
  text_resolution?: string | null;
  video_resolution_url?: string | null;
  options?: QuestionOptionPayload[];
  content_ids: number[];
  topic_ids?: number[];
};

export type Content = {
  id: number;
  name: string;
};

export type Topic = {
  id: number;
  name: string;
  content_id: number;
};

export type QuestionOption = {
  id: number;
  text: string;
  is_correct: boolean;
  order: number;
};

export type Question = {
  id: number;
  statement: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  correct_answer: string | null;
  difficulty: string;
  text_resolution: string | null;
  video_resolution_url: string | null;
  options: QuestionOption[] | null;
  contents: Content[] | null;
  topics: Topic[] | null;
  created_at: string;
  updated_at: string;
};

export type AnswerResult = {
  is_correct: boolean;
  points_earned: number;
  correct_answer: string | null;
  text_resolution: string | null;
};

export type Dashboard = {
  points: number;
  streak: number;
  total_answered: number;
  correct: number;
  incorrect: number;
  accuracy_percentage: number | null;
  best_topic: { id: number; name: string; correct_count: number } | null;
};
