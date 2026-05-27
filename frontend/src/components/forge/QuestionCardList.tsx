import { ClipboardList, RotateCcw, Send } from 'lucide-react';
import type { QuizTask } from '../../types/types';
import QuestionCard from './QuestionCard';

interface QuestionCardListProps {
  tasks: QuizTask[];
  onUpdateTask: (index: number, updatedTask: QuizTask) => void;
  onDeleteTask: (index: number) => void;
  onSavePublish: () => void;
  onStartOver: () => void;
}

export default function QuestionCardList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onSavePublish,
  onStartOver,
}: QuestionCardListProps) {
  const mcCount = tasks.filter((t) => t.question_type === 'multiple_choice').length;
  const tfCount = tasks.filter((t) => t.question_type === 'true_false').length;
  const totalXp = tasks.reduce((sum, t) => sum + t.xp_reward, 0);

  return (
    <div className="animate-fade-in grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="section-card rounded-[28px] p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
              <ClipboardList size={18} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Quiz Overview</p>
              <h3 className="text-lg font-semibold text-slate-900">Question workspace</h3>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs text-slate-500">Questions</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{tasks.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs text-slate-500">Total XP</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{totalXp}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs text-slate-500">MC</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{mcCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs text-slate-500">T/F</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{tfCount}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-900">Editing flow</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review the generated draft on the right, adjust the wording, then publish when the set feels balanced.
            </p>
          </div>
        </div>

        <div className="section-card rounded-[28px] p-4">
          <div className="flex gap-2">
            <button
              onClick={onStartOver}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw size={16} />
              Start Over
            </button>
            <button
              onClick={onSavePublish}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <Send size={16} />
              Publish
            </button>
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        {/* Question cards */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <QuestionCard
              key={index}
              task={task}
              index={index}
              onUpdate={(updated) => onUpdateTask(index, updated)}
              onDelete={() => onDeleteTask(index)}
            />
          ))}
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="section-card rounded-[28px] py-20 text-center">
            <p className="text-sm text-slate-500">All questions have been removed.</p>
            <button
              onClick={onStartOver}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
            >
              <RotateCcw size={14} />
              Start Over
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
