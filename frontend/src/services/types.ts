export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type Content = {
  id: number;
  name: string;
};

export type Topic = {
  id: number;
  name: string;
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
  correct_answer: string;
  difficulty: string;
  text_resolution: string | null;
  video_resolution_url: string | null;
  options: QuestionOption[] | null;
  contents: Content[] | null;
  topics: Topic[] | null;
  created_at: string;
  updated_at: string;
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
