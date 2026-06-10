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
        placeholder="Lektion, Abschnitt oder Text hier einfügen …"
        className="min-h-[200px] resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length.toLocaleString()} characters
          {!isValid && text.length > 0 && (
            <span className="ml-2 text-destructive">· noch {50 - text.trim().length} Zeichen nötig</span>
          )}
        </span>
        <Button onClick={() => isValid && onSubmit(text.trim())} disabled={!isValid}>
          <ArrowUp size={16} />
          Quiz erstellen
        </Button>
      </div>
    </div>
  );
}
