import type { QuizBundle } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function generateQuizFromText(rawText: string): Promise<QuizBundle> {
  const response = await fetch(`${API_BASE}/api/v1/generate-quiz/from-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw_text: rawText }),
  });

  return parseResponse<QuizBundle>(response);
}

export async function generateQuizFromPdf(file: File): Promise<QuizBundle> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/v1/generate-quiz/from-pdf`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse<QuizBundle>(response);
}
