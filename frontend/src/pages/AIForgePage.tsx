import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import type { ForgePhase, QuizTask } from '@/types';
import { quizApi } from '@/services/api';
import FileDropZone from '@/components/forge/FileDropZone';
import TextInputArea from '@/components/forge/TextInputArea';
import LoadingState from '@/components/forge/LoadingState';
import QuestionCardList from '@/components/forge/QuestionCardList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Quiz konnte nicht erstellt werden.';
      setError(message);
      toast.error(message);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Quiz konnte nicht erstellt werden.';
      setError(message);
      toast.error(message);
      setPhase('input');
    }
  };

  const handleUpdateTask = (index: number, updatedTask: QuizTask) => {
    setTasks((prev) => prev.map((t, i) => (i === index ? updatedTask : t)));
  };

  const handleDeleteTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartOver = () => {
    setPhase('input');
    setTasks([]);
    setError(null);
  };

  if (phase === 'processing') {
    return <LoadingState />;
  }

  if (phase === 'editor') {
    return (
      <QuestionCardList
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-10">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">KI-Werkzeug</p>
        <h2 className="font-serif text-5xl font-medium tracking-tight text-foreground leading-tight">
          Aus einer Lektion ein Quiz machen.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          PDF hochladen oder Text einfügen. Jede Frage prüfen und verfeinern, bevor sie an die Klasse gesendet wird.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4 pt-7 px-7">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <CardDescription className="text-primary font-semibold text-sm m-0">Neues Quiz</CardDescription>
          </div>
          <CardTitle className="text-2xl mt-1">Lerninhalt hinzufügen</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'file' | 'text')}>
            <TabsList className="mb-6">
              <TabsTrigger value="file">PDF hochladen</TabsTrigger>
              <TabsTrigger value="text">Text einfügen</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="mt-0">
              <FileDropZone onFileAccepted={handleGenerateFromFile} />
            </TabsContent>
            <TabsContent value="text" className="mt-0">
              <TextInputArea onSubmit={handleGenerateFromText} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
