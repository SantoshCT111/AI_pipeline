import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { QuizTask } from '../../types/types';

interface QuestionCardProps {
  task: QuizTask;
  index: number;
  onUpdate: (updated: QuizTask) => void;
  onDelete: () => void;
}

export default function QuestionCard({ task, index, onUpdate, onDelete }: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isMultipleChoice = task.question_type === 'multiple_choice';
  const typeLabel = isMultipleChoice ? 'Multiple Choice' : 'True / False';

  const handleQuestionChange = (value: string) => {
    onUpdate({ ...task, question_text: value });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...task.options];
    // If we're editing the currently correct answer, update correct_answer too
    if (newOptions[optionIndex] === task.correct_answer) {
      newOptions[optionIndex] = value;
      onUpdate({ ...task, options: newOptions, correct_answer: value });
    } else {
      newOptions[optionIndex] = value;
      onUpdate({ ...task, options: newOptions });
    }
  };

  const handleCorrectAnswerChange = (option: string) => {
    onUpdate({ ...task, correct_answer: option });
  };

  const handleExplanationChange = (value: string) => {
    onUpdate({ ...task, explanation: value });
  };

  const handleXpChange = (value: number) => {
    const clamped = Math.min(100, Math.max(10, value));
    onUpdate({ ...task, xp_reward: clamped });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="animate-fade-in rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Question number */}
          <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
          Q{index + 1}
        </span>

        {/* Type badge */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isMultipleChoice
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700'
          }`}
        >
          {typeLabel}
        </span>

        {/* XP badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
          <Sparkles size={12} />
          {task.xp_reward} XP
        </span>

        {/* Delete button - pushed to right */}
        <div className="ml-auto">
          <button
            onClick={handleDeleteClick}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              confirmDelete
                ? 'border border-red-200 bg-red-50 text-[#DC2626]'
                : 'text-slate-400 hover:bg-red-50 hover:text-[#DC2626]'
            }`}
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Question text */}
      <div className="mb-5">
        <textarea
          value={task.question_text}
          onChange={(e) => handleQuestionChange(e.target.value)}
          rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </div>

      {/* Answer options */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#64748B] uppercase tracking-wider mb-3">
          Answer Options
        </label>

        <div className={`grid gap-2.5 ${isMultipleChoice ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
          {task.options.map((option, optIdx) => (
            <label
              key={optIdx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-all duration-200 ${
                task.correct_answer === option
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={`correct-${index}`}
                checked={task.correct_answer === option}
                onChange={() => handleCorrectAnswerChange(option)}
                className="w-4 h-4 text-[#16A34A] accent-[#16A34A] flex-shrink-0 cursor-pointer"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 border-none focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Explanation toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
        </button>

        {showExplanation && (
          <div className="mt-3 animate-fade-in">
            <textarea
              value={task.explanation}
              onChange={(e) => handleExplanationChange(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              placeholder="Explanation for the correct answer..."
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>
        )}
      </div>

      {/* XP reward */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <label className="text-xs font-medium text-slate-500">XP Reward</label>
        <input
          type="number"
          min={10}
          max={100}
          step={5}
          value={task.xp_reward}
          onChange={(e) => handleXpChange(Number(e.target.value))}
          className="w-20 rounded-xl border border-slate-200 px-2.5 py-1.5 text-center text-sm text-slate-900 transition-all duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        />
      </div>
    </div>
  );
}
