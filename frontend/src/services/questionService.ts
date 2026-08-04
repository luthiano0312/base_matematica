import { http } from './http';
import type { AnswerResult, Question } from './types';

export type QuestionFilter = {
  mode?: 'normal' | 'progression';
  difficulty?: string;
  quantidade?: number;
  content_id?: number;
  topic_id?: number;
  type?: string;
  types?: string[];
};

export function getPublicQuestions(params: QuestionFilter = {}) {
  return http
    .get<{ data: Question[] }>('/public/questions', { params })
    .then((res) => res.data.data);
}

export function getFilteredQuestions(params: QuestionFilter) {
  return http
    .get<{ data: Question[] }>('/questions', { params })
    .then((res) => res.data.data);
}

export function getRecommendedQuestions() {
  return http
    .get<{ data: Question[] }>('/me/recommended-questions')
    .then((res) => res.data.data);
}

export function answerMultipleChoice(questionId: number, optionId: number) {
  return http
    .post<AnswerResult>(`/questions/${questionId}/answers`, { option_id: optionId })
    .then((res) => res.data);
}

export function answerTrueFalse(questionId: number, answer: 'certo' | 'errado') {
  return http
    .post<AnswerResult>(`/questions/${questionId}/answers`, { answer })
    .then((res) => res.data);
}

export function answerEssay(questionId: number, answer: string, selfCorrected: boolean) {
  return http
    .post<AnswerResult>(`/questions/${questionId}/answers`, { answer, self_corrected: selfCorrected })
    .then((res) => res.data);
}
