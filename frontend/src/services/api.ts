import { parseResponse } from '@/lib/http';
import type {
  AnalyticsSummary,
  Announcement,
  AnnouncementCreate,
  ClassroomFilter,
  QuizBundle,
  QuizPublishPayload,
  QuizResponse,
  QuizResultsSummary,
  Subject,
  SubjectCreate,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const quizApi = {
  generateFromText(rawText: string): Promise<QuizBundle> {
    return fetch(`${API_BASE}/api/v1/generate-quiz/from-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    }).then((response) => parseResponse<QuizBundle>(response));
  },

  generateFromFile(file: File): Promise<QuizBundle> {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/api/v1/generate-quiz/from-pdf`, {
      method: 'POST',
      body: formData,
    }).then((response) => parseResponse<QuizBundle>(response));
  },

  publish(payload: QuizPublishPayload): Promise<QuizResponse> {
    return fetch(`${API_BASE}/api/v1/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<QuizResponse>(response));
  },

  list(filter?: Partial<ClassroomFilter>): Promise<QuizResponse[]> {
    const params = new URLSearchParams();
    if (filter?.subject) params.set('subject', filter.subject);
    if (filter?.grade) params.set('grade', filter.grade);
    if (filter?.section) params.set('section', filter.section);
    const query = params.toString();
    return fetch(`${API_BASE}/api/v1/quizzes${query ? `?${query}` : ''}`).then((response) =>
      parseResponse<QuizResponse[]>(response),
    );
  },
};

export const analyticsApi = {
  getSummary(filter: ClassroomFilter): Promise<AnalyticsSummary> {
    const params = new URLSearchParams(filter);
    return fetch(`${API_BASE}/api/v1/analytics/summary?${params}`).then((response) =>
      parseResponse<AnalyticsSummary>(response),
    );
  },
};

export const resultsApi = {
  getQuizResults(quizId: number): Promise<QuizResultsSummary> {
    return fetch(`${API_BASE}/api/v1/quiz-results/${quizId}`).then((response) =>
      parseResponse<QuizResultsSummary>(response),
    );
  },
};

export const announcementsApi = {
  list(): Promise<Announcement[]> {
    return fetch(`${API_BASE}/api/v1/announcements`).then((response) =>
      parseResponse<Announcement[]>(response),
    );
  },

  create(payload: AnnouncementCreate): Promise<Announcement> {
    return fetch(`${API_BASE}/api/v1/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<Announcement>(response));
  },
};

export const subjectApi = {
  list(): Promise<Subject[]> {
    return fetch(`${API_BASE}/api/v1/subjects`).then((response) =>
      parseResponse<Subject[]>(response),
    );
  },

  create(payload: SubjectCreate): Promise<Subject> {
    return fetch(`${API_BASE}/api/v1/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<Subject>(response));
  },

  delete(subjectId: number): Promise<{ message: string }> {
    return fetch(`${API_BASE}/api/v1/subjects/${subjectId}`, {
      method: 'DELETE',
    }).then((response) => parseResponse<{ message: string }>(response));
  },

  updateLevels(subjectId: number, levels: { title: string }[]): Promise<Subject> {
    return fetch(`${API_BASE}/api/v1/subjects/${subjectId}/levels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levels),
    }).then((response) => parseResponse<Subject>(response));
  },
};


