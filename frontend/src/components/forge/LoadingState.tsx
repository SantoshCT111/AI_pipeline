import { useState, useEffect } from 'react';
import { Loader2, Lightbulb } from 'lucide-react';

const tips = [
  'You can edit all questions after generation',
  'Adjust XP rewards to match question difficulty',
  'You can delete questions that don\'t fit your lesson',
  'True/False questions work great for quick concept checks',
  'Mix question types for a more engaging quiz experience',
];

export default function LoadingState() {
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setTipVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in flex items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/5">
            <Loader2 size={30} className="animate-spin text-slate-900" />
          </div>
        </div>

        {/* Primary text */}
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          Generating your quiz...
        </h3>

        {/* Secondary text */}
        <p className="mb-8 text-sm leading-relaxed text-slate-500">
          Our AI is analyzing your content and crafting questions.
          <br />
          This usually takes 15–30 seconds.
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#2563EB]/40 animate-pulse"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </div>

        {/* Cycling tips */}
        <div className="border-t border-slate-100 pt-5">
          <div
            className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${
              tipVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Lightbulb size={14} className="flex-shrink-0 text-amber-500" />
            <span className="text-xs text-slate-500">
              <span className="font-medium text-slate-900">Tip:</span>{' '}
              {tips[tipIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
