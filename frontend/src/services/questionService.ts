import { http } from './http';
import type { Question } from './types';

export type QuestionFilter = {
  mode?: 'normal' | 'progression';
  difficulty?: string;
  quantidade?: number;
  content_id?: number;
  topic_id?: number;
  type?: string;
};

export function getPublicQuestions() {
  return http.get<Question[]>('/public/questions').then((res) => res.data);
}

export function getFilteredQuestions(params: QuestionFilter) {
  return http.get<Question[]>('/questions', { params }).then((res) => res.data);
}

export function getRecommendedQuestions() {
  return http.get<Question[]>('/me/recommended-questions').then((res) => res.data);
}

export function answerMultipleChoice(questionId: number, optionId: number) {
  return http
    .post(`/questions/${questionId}/answers`, { option_id: optionId })
    .then((res) => res.data);
}

export function answerTrueFalse(questionId: number, answer: 'certo' | 'errado') {
  return http
    .post(`/questions/${questionId}/answers`, { answer })
    .then((res) => res.data);
}

export function answerEssay(questionId: number, answer: string, selfCorrected: boolean) {
  return http
    .post(`/questions/${questionId}/answers`, { answer, self_corrected: selfCorrected })
    .then((res) => res.data);
}
