import { useState } from 'react';

interface TextInputAreaProps {
  onSubmit: (text: string) => void;
}

export default function TextInputArea({ onSubmit }: TextInputAreaProps) {
  const [text, setText] = useState('');

  const isValid = text.trim().length >= 50;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="animate-fade-in relative mx-auto mt-6 max-w-3xl">
      {/* Textarea */}
      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-900/10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lesson content to generate a quiz..."
          className="min-h-[180px] max-h-[420px] w-full resize-y bg-transparent p-5 pr-12 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Action row docked inside textarea */}
        <div className="flex items-center justify-between bg-transparent px-4 py-3">
          <span className="pl-1 text-xs text-slate-400">
            {text.length.toLocaleString()} chars
          </span>

          <div className="flex items-center gap-2">
            {!isValid && text.length > 0 && (
              <span className="text-xs font-medium text-amber-600">
                {50 - text.trim().length} more needed
              </span>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                isValid
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
