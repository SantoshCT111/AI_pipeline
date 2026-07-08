import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, RotateCcw, Send } from 'lucide-react';
import type { ClassroomFilter, QuizTask, Subject } from '@/types';
import { DEFAULT_GRADE, DEFAULT_SECTION, SUBJECTS } from '@/types';
import { quizApi, subjectApi } from '@/services/api';
import QuestionCard from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionCardListProps {
  tasks: QuizTask[];
  onUpdateTask: (index: number, updatedTask: QuizTask) => void;
  onDeleteTask: (index: number) => void;
  onStartOver: () => void;
}

export default function QuestionCardList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onStartOver,
}: QuestionCardListProps) {
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lektion Quiz');

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    subjectApi.list().then((data) => {
      setDbSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0].name);
    }).catch(() => {});
  }, []);

  const mcCount = tasks.filter((t) => t.question_type === 'multiple_choice').length;
  const tfCount = tasks.filter((t) => t.question_type === 'true_false').length;
  const totalXp = tasks.reduce((sum, t) => sum + t.xp_reward, 0);

  const classroom: ClassroomFilter = {
    subject: selectedSubject,
    grade: DEFAULT_GRADE,
    section: DEFAULT_SECTION,
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) {
      toast.error('Bitte einen Quiz-Titel eingeben.');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Mindestens eine Frage hinzufügen, bevor veröffentlicht werden kann.');
      return;
    }
    setPublishing(true);
    try {
      await quizApi.publish({ title: quizTitle.trim(), ...classroom, level_number: null, tasks });
      toast.success(`Quiz veröffentlicht für ${selectedSubject}`);
      setPublishOpen(false);
      onStartOver();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Quiz konnte nicht veröffentlicht werden.');
    } finally {
      setPublishing(false);
    }
  };

  const subjectOptions = dbSubjects.length > 0 ? dbSubjects.map((s) => s.name) : SUBJECTS;
  const assignmentComplete = !!selectedSubject;

  return (
    <div className="animate-fade-in grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">

      {/* ── Sticky sidebar ──────────────────────────────── */}
      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start lg:pb-6">

        {/* Quiz stats */}
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <CardDescription className="text-sm font-medium">Entwurf</CardDescription>
            <CardTitle className="text-xl">Dein Quiz</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5 px-5 pb-5">
            {[
              { label: 'Fragen',      value: tasks.length },
              { label: 'XP gesamt',   value: totalXp },
              { label: 'Mehrfach',    value: mcCount },
              { label: 'Wahr/Falsch', value: tfCount },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/50 px-4 py-3.5">
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{item.label}</p>
                <p className="mt-0.5 text-3xl font-semibold tabular-nums">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assignment — subject only */}
        <Card className="border-primary/20 bg-primary/[0.025]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-primary font-bold text-[10px] tracking-widest uppercase m-0">Zuweisung</CardDescription>
            <CardTitle className="text-sm font-semibold mt-0.5">An wen geht das Quiz?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 px-4 pb-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <BookOpen size={10} /> Fach
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Fach wählen …" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assignmentComplete && (
              <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-semibold flex items-center gap-1.5">
                <span>📌</span>
                <span className="truncate">{selectedSubject}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onStartOver} className="w-full h-9 text-sm">
            <RotateCcw size={14} />
            Von vorne
          </Button>
          <Button
            onClick={() => setPublishOpen(true)}
            disabled={tasks.length === 0 || !assignmentComplete}
            className="w-full h-10 text-sm font-semibold"
          >
            <Send size={14} />
            Quiz veröffentlichen
          </Button>
          {!assignmentComplete && (
            <p className="text-center text-xs text-muted-foreground leading-snug">
              Bitte zuerst ein Fach auswählen.
            </p>
          )}
        </div>
      </aside>

      {/* ── Question list ────────────────────────────────── */}
      <section className="space-y-5">
        {tasks.map((task, index) => (
          <QuestionCard
            key={`${index}-${task.question_text.slice(0, 20)}`}
            task={task}
            index={index}
            onUpdate={(updated) => onUpdateTask(index, updated)}
            onDelete={() => onDeleteTask(index)}
          />
        ))}
        {tasks.length === 0 && (
          <Card className="py-20 text-center border-2 border-dashed">
            <p className="text-base text-muted-foreground">Alle Fragen entfernt.</p>
            <Button variant="link" onClick={onStartOver} className="mt-3 text-base">
              Von vorne beginnen
            </Button>
          </Card>
        )}
      </section>

      {/* ── Publish dialog ────────────────────────────────── */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Fast fertig!</DialogTitle>
            <DialogDescription className="text-base mt-1">
              Nur noch einen Namen für das Quiz vergeben – dann wird es veröffentlicht.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-muted/50 border px-5 py-4">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Zuweisung</p>
            <Badge variant="secondary" className="text-sm px-3 py-1">{selectedSubject}</Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-title" className="text-base font-semibold">Quiz-Titel</Label>
            <Input
              id="quiz-title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="z. B. Brüche üben"
              className="h-12 text-base"
              onKeyDown={(e) => e.key === 'Enter' && !publishing && handlePublish()}
              autoFocus
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setPublishOpen(false)} className="h-11 text-base">
              Zurück
            </Button>
            <Button onClick={handlePublish} disabled={publishing} className="h-11 text-base flex-1">
              {publishing ? 'Wird veröffentlicht …' : '🚀 Jetzt veröffentlichen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
