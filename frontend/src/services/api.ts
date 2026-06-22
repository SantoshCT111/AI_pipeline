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

// ─── Auth helpers ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Login failed');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data;
  },

  async register(email: string, password: string, name: string, role: string = 'student'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Registration failed');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};

// ─── Quiz API ────────────────────────────────────────────────────────────────

export const quizApi = {
  generateFromText(rawText: string): Promise<QuizBundle> {
    return fetch(`${API_BASE}/api/v1/generate-quiz/from-text`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ raw_text: rawText }),
    }).then((response) => parseResponse<QuizBundle>(response));
  },

  generateFromFile(file: File): Promise<QuizBundle> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/generate-quiz/from-pdf`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((response) => parseResponse<QuizBundle>(response));
  },

  publish(payload: QuizPublishPayload): Promise<QuizResponse> {
    return fetch(`${API_BASE}/api/v1/quizzes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<QuizResponse>(response));
  },

  list(filter?: Partial<ClassroomFilter>): Promise<QuizResponse[]> {
    const params = new URLSearchParams();
    if (filter?.subject) params.set('subject', filter.subject);
    if (filter?.grade) params.set('grade', filter.grade);
    if (filter?.section) params.set('section', filter.section);
    const query = params.toString();
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/quizzes${query ? `?${query}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<QuizResponse[]>(response));
  },
};

export const analyticsApi = {
  getSummary(filter: ClassroomFilter): Promise<AnalyticsSummary> {
    const params = new URLSearchParams(filter);
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/analytics/summary?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<AnalyticsSummary>(response));
  },
};

export const resultsApi = {
  getQuizResults(quizId: number): Promise<QuizResultsSummary> {
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/quiz-results/${quizId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<QuizResultsSummary>(response));
  },
};

export const announcementsApi = {
  list(): Promise<Announcement[]> {
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/announcements`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<Announcement[]>(response));
  },

  create(payload: AnnouncementCreate): Promise<Announcement> {
    return fetch(`${API_BASE}/api/v1/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<Announcement>(response));
  },
};

export const subjectApi = {
  list(): Promise<Subject[]> {
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/subjects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<Subject[]>(response));
  },

  create(payload: SubjectCreate): Promise<Subject> {
    return fetch(`${API_BASE}/api/v1/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then((response) => parseResponse<Subject>(response));
  },

  delete(subjectId: number): Promise<{ message: string }> {
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE}/api/v1/subjects/${subjectId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((response) => parseResponse<{ message: string }>(response));
  },

  updateLevels(subjectId: number, levels: { title: string }[]): Promise<Subject> {
    return fetch(`${API_BASE}/api/v1/subjects/${subjectId}/levels`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(levels),
    }).then((response) => parseResponse<Subject>(response));
  },
};

// ─── AI Chat API ─────────────────────────────────────────────────────────────

export interface AIChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface AnalyticsContext {
  subject: string;
  grade: string;
  section: string;
  avg_score: number;
  completion_rate: number;
  students_count: number;
  topics: { topic: string; accuracy: number; status: string }[];
  recent_quizzes: { title: string; level_number: number | null; created_at: string }[];
}

export interface CommsContext {
  announcements: {
    title: string;
    body: string;
    priority: string;
    grade: string | null;
    section: string | null;
    created_at: string;
  }[];
}

export interface DraftAction {
  type: 'draft';
  title: string;
  body: string;
  priority: string;
}

export interface AIChatResponse {
  reply: string;
  action: DraftAction | null;
}

export const aiChatApi = {
  send(
    message: string,
    contextType: 'analytics' | 'comms',
    history: AIChatMessage[],
    analyticsContext?: AnalyticsContext,
    commsContext?: CommsContext,
  ): Promise<AIChatResponse> {
    return fetch(`${API_BASE}/api/v1/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        context_type: contextType,
        history,
        analytics_context: analyticsContext ?? null,
        comms_context: commsContext ?? null,
      }),
    }).then((response) => parseResponse<AIChatResponse>(response));
  },
};
