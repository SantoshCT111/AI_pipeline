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
      const message = err instanceof Error ? err.message : 'Failed to generate quiz.';
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
      const message = err instanceof Error ? err.message : 'Failed to generate quiz.';
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
    <div className="animate-fade-in space-y-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium mb-3">AI Forge</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight">
          Turn a lesson into a quiz.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">
          Upload a PDF or paste text. Review and refine each question before sending it to your class.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} />
            <CardDescription className="text-primary font-medium m-0">New quiz</CardDescription>
          </div>
          <CardTitle className="text-xl">Add your lesson content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'file' | 'text')}>
            <TabsList className="mb-6">
              <TabsTrigger value="file">Upload PDF</TabsTrigger>
              <TabsTrigger value="text">Paste text</TabsTrigger>
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
