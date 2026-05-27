import { useState } from 'react';
import type { QuizTask, ForgePhase } from '../types/types';
import { quizApi } from '../services/api';
import FileDropZone from '../components/forge/FileDropZone';
import TextInputArea from '../components/forge/TextInputArea';
import LoadingState from '../components/forge/LoadingState';
import QuestionCardList from '../components/forge/QuestionCardList';
import { Clock3, Sparkles, Wand2, BadgeCheck, BookOpenText } from 'lucide-react';

export default function AIForgePage() {
  const [phase, setPhase] = useState<ForgePhase>('input');
  const [tasks, setTasks] = useState<QuizTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const handleGenerateFromFile = async (file: File) => {
    setPhase('processing');
    setError(null);
    try {
      const result = await quizApi.generateFromFile(file);
      setTasks(result.tasks);
      setPhase('editor');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to generate quiz. Please try again.');
      setPhase('input');
    }
  };

  const handleGenerateFromText = async (text: string) => {
    setPhase('processing');
    setError(null);
    try {
      const result = await quizApi.generateFromText(text);
      setTasks(result.tasks);
      setPhase('editor');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to generate quiz. Please try again.');
      setPhase('input');
    }
  };

  const handleUpdateTask = (index: number, updatedTask: QuizTask) => {
    setTasks(prev => prev.map((t, i) => (i === index ? updatedTask : t)));
  };

  const handleDeleteTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePublish = () => {
    console.log('Publishing quiz:', { tasks });
    alert('Quiz published successfully! (Backend save endpoint not yet implemented)');
  };

  const handleStartOver = () => {
    setPhase('input');
    setTasks([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {phase === 'input' && (
        <div className="animate-fade-in space-y-6">
          {/* Hero section */}
          <div className="hero-card rounded-[32px] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-center">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                  <Sparkles size={12} />
                  Designed for teachers
                </div>

                <h2 className="page-title mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Turn one lesson into a polished quiz in minutes.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Upload a PDF or paste lesson text, then let the assistant draft clear questions, balanced answer sets, and editable explanations you can trust.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <Clock3 size={14} className="text-slate-400" />
                    Save prep time
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    Teacher-ready drafts
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <Wand2 size={14} className="text-indigo-500" />
                    Editable in seconds
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workflow</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">From lesson to quiz</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <BookOpenText size={20} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      'Upload or paste your lesson content',
                      'Generate multiple-choice and true/false questions',
                      'Edit wording, explanations, and XP before publishing',
                    ].map((step, index) => (
                      <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 shadow-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-6 text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <span className="text-red-700 font-medium text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-sm font-medium text-red-500 transition-colors hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input mode toggle */}
          <div className="flex justify-center">
            <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <button
                onClick={() => setInputMode('file')}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  inputMode === 'file'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Upload PDF
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  inputMode === 'text'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="section-card rounded-[32px] p-5 sm:p-6">
            {inputMode === 'file' ? (
              <FileDropZone onFileAccepted={handleGenerateFromFile} />
            ) : (
              <TextInputArea onSubmit={handleGenerateFromText} />
            )}
          </div>
        </div>
      )}

      {phase === 'processing' && <LoadingState />}

      {phase === 'editor' && (
        <QuestionCardList
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onSavePublish={handleSavePublish}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
