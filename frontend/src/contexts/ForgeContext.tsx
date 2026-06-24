/**
 * ForgeContext — persists quiz generation state (phase + tasks) across navigation.
 * Wrap the app in <ForgeProvider> and consume with useForge() in AIForgePage.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ForgePhase, QuizTask } from '@/types';

interface ForgeState {
  phase: ForgePhase;
  tasks: QuizTask[];
  error: string | null;
  setPhase: (p: ForgePhase) => void;
  setTasks: (t: QuizTask[]) => void;
  setError: (e: string | null) => void;
  updateTask: (index: number, task: QuizTask) => void;
  deleteTask: (index: number) => void;
  reset: () => void;
}

const ForgeContext = createContext<ForgeState | null>(null);

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ForgePhase>('input');
  const [tasks, setTasks] = useState<QuizTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateTask = (index: number, task: QuizTask) =>
    setTasks((prev) => prev.map((t, i) => (i === index ? task : t)));

  const deleteTask = (index: number) =>
    setTasks((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setPhase('input');
    setTasks([]);
    setError(null);
  };

  return (
    <ForgeContext.Provider value={{ phase, tasks, error, setPhase, setTasks, setError, updateTask, deleteTask, reset }}>
      {children}
    </ForgeContext.Provider>
  );
}

export function useForge() {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error('useForge must be used inside <ForgeProvider>');
  return ctx;
}
