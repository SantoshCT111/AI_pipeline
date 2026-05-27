import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { QuizTask } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  task: QuizTask;
  index: number;
  onUpdate: (updated: QuizTask) => void;
  onDelete: () => void;
}

export default function QuestionCard({ task, index, onUpdate, onDelete }: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(index < 2);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isMultipleChoice = task.question_type === 'multiple_choice';

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...task.options];
    const wasCorrect = newOptions[optionIndex] === task.correct_answer;
    newOptions[optionIndex] = value;
    onUpdate({
      ...task,
      options: newOptions,
      correct_answer: wasCorrect ? value : task.correct_answer,
    });
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
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 pb-3">
        <Badge variant="secondary">Q{index + 1}</Badge>
        <Badge variant="outline">{isMultipleChoice ? 'Multiple choice' : 'True / false'}</Badge>
        <Badge>{task.xp_reward} XP</Badge>
        <Button
          variant={confirmDelete ? 'destructive' : 'ghost'}
          size="sm"
          className="ml-auto"
          onClick={handleDeleteClick}
        >
          <Trash2 size={14} />
          {confirmDelete ? 'Confirm' : 'Delete'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            value={task.question_text}
            onChange={(e) => onUpdate({ ...task, question_text: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Answers</Label>
          <div className={cn('grid gap-2', isMultipleChoice ? 'sm:grid-cols-2' : 'max-w-sm')}>
            {task.options.map((option, optIdx) => (
              <label
                key={optIdx}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                  task.correct_answer === option
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:border-primary/20',
                )}
              >
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={task.correct_answer === option}
                  onChange={() => onUpdate({ ...task, correct_answer: option })}
                  className="accent-primary"
                />
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto p-0"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <Button variant="ghost" size="sm" onClick={() => setShowExplanation(!showExplanation)}>
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showExplanation ? 'Hide explanation' : 'Show explanation'}
          </Button>
          {showExplanation && (
            <Textarea
              className="mt-3"
              value={task.explanation}
              onChange={(e) => onUpdate({ ...task, explanation: e.target.value })}
              rows={3}
              placeholder="Explanation for students…"
            />
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Label className="text-muted-foreground">XP</Label>
          <Input
            type="number"
            min={10}
            max={100}
            step={5}
            value={task.xp_reward}
            onChange={(e) =>
              onUpdate({
                ...task,
                xp_reward: Math.min(100, Math.max(10, Number(e.target.value))),
              })
            }
            className="w-20"
          />
        </div>
      </CardContent>
    </Card>
  );
}
