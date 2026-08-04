import { http } from './http';
import type { Content, Topic } from './types';

export function getContents() {
  return http.get<Content[]>('/contents').then((res) => res.data);
}

export function getTopics(contentId?: number) {
  return http
    .get<Topic[]>('/topics', { params: contentId ? { content_id: contentId } : {} })
    .then((res) => res.data);
}
