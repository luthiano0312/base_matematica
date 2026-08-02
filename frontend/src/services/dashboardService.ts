import { http } from './http';
import type { Content, Dashboard } from './types';

export function getDashboard() {
  return http.get<Dashboard>('/me/dashboard').then((res) => res.data);
}

export function getInterests() {
  return http.get<Content[]>('/me/interests').then((res) => res.data);
}

export function updateInterests(contentIds: number[]) {
  return http.put<Content[]>('/me/interests', { content_ids: contentIds }).then((res) => res.data);
}

export function saveOnboardingInterests(contentIds: number[]) {
  return http
    .post<Content[]>('/onboarding/interests', { content_ids: contentIds })
    .then((res) => res.data);
}
