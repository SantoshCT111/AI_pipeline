import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextInputAreaProps {
  onSubmit: (text: string) => void;
}

export default function TextInputArea({ onSubmit }: TextInputAreaProps) {
  const [text, setText] = useState('');
  const isValid = text.trim().length >= 50;

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your lesson, passage, or reading here…"
        className="min-h-[200px] resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length.toLocaleString()} characters
          {!isValid && text.length > 0 && (
            <span className="ml-2 text-destructive">· {50 - text.trim().length} more needed</span>
          )}
        </span>
        <Button onClick={() => isValid && onSubmit(text.trim())} disabled={!isValid}>
          <ArrowUp size={16} />
          Generate quiz
        </Button>
      </div>
    </div>
  );
}
