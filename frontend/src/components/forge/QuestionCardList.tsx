import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Send } from 'lucide-react';
import type { ClassroomFilter, QuizTask, Subject, QuizResponse } from '@/types';
import { GRADES, SECTIONS, SUBJECTS } from '@/types';
import { quizApi, subjectApi } from '@/services/api';
import ClassroomSelects from '@/components/ClassroomSelects';
import QuestionCard from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [quizTitle, setQuizTitle] = useState('Lesson quiz');
  const [classroom, setClassroom] = useState<ClassroomFilter>({
    subject: SUBJECTS[0],
    grade: GRADES[2],
    section: SECTIONS[1],
  });
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
  const [existingQuizzes, setExistingQuizzes] = useState<QuizResponse[]>([]);
  const [levelNumber, setLevelNumber] = useState<number | null>(null);

  useEffect(() => {
    subjectApi.list().then((data) => {
      setDbSubjects(data);
      if (data.length > 0) {
        setClassroom((prev) => ({ ...prev, subject: data[0].name }));
      }
    }).catch(() => {});

    quizApi.list().then((data) => {
      setExistingQuizzes(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classroom.subject || dbSubjects.length === 0) return;
    const activeSubjectObj = dbSubjects.find((s) => s.name === classroom.subject);
    if (!activeSubjectObj) return;

    const subjectQuizzes = existingQuizzes.filter(
      (q) => q.subject.toLowerCase() === classroom.subject.toLowerCase()
    );

    const levelsWithQuizzes = new Set(subjectQuizzes.map((q) => q.level_number).filter((n): n is number => n !== null && n !== undefined));
    const nextLevelObj = activeSubjectObj.levels.find((l) => !levelsWithQuizzes.has(l.level_number));

    if (nextLevelObj) {
      setLevelNumber(nextLevelObj.level_number);
    } else {
      setLevelNumber(activeSubjectObj.levels.length > 0 ? 1 : null);
    }
  }, [classroom.subject, dbSubjects, existingQuizzes]);

  const activeSubjectObj = dbSubjects.find((s) => s.name === classroom.subject);
  const subjectLevels = activeSubjectObj ? activeSubjectObj.levels : [];

  const mcCount = tasks.filter((t) => t.question_type === 'multiple_choice').length;
  const tfCount = tasks.filter((t) => t.question_type === 'true_false').length;
  const totalXp = tasks.reduce((sum, t) => sum + t.xp_reward, 0);

  const handlePublish = async () => {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title.');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Add at least one question before publishing.');
      return;
    }

    setPublishing(true);
    try {
      await quizApi.publish({
        title: quizTitle.trim(),
        ...classroom,
        level_number: levelNumber,
        tasks,
      });
      toast.success(
        `Quiz published to ${classroom.subject} · ${classroom.grade} · ${classroom.section}`,
      );
      setPublishOpen(false);
      onStartOver();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fade-in grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overview</CardDescription>
            <CardTitle className="text-lg">Your draft</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'Questions', value: tasks.length },
              { label: 'Total XP', value: totalXp },
              { label: 'Multiple choice', value: mcCount },
              { label: 'True / false', value: tfCount },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-muted/30 px-3 py-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-medium tabular-nums">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onStartOver} className="w-full">
            <RotateCcw size={16} />
            Start over
          </Button>
          <Button onClick={() => setPublishOpen(true)} disabled={tasks.length === 0} className="w-full">
            <Send size={16} />
            Publish quiz
          </Button>
        </div>
      </aside>

      <section className="space-y-4">
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
          <Card className="py-16 text-center">
            <p className="text-sm text-muted-foreground">All questions removed.</p>
            <Button variant="link" onClick={onStartOver} className="mt-2">
              Start over
            </Button>
          </Card>
        )}
      </section>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish quiz</DialogTitle>
            <DialogDescription>
              Save this quiz and assign it to a class. You can edit questions before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz title</Label>
              <Input
                id="quiz-title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Fractions review"
              />
            </div>
            <Separator />
            <ClassroomSelects
              values={classroom}
              onChange={(val) => {
                setClassroom(val);
                setLevelNumber(null);
              }}
              subjectsList={dbSubjects.map((s) => s.name)}
            />
            <div className="space-y-2">
              <Label>App Subject Level (Target Level)</Label>
              <Select
                value={levelNumber?.toString() || 'none'}
                onValueChange={(val) => setLevelNumber(val === 'none' ? null : parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specific level (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default / Global (Shows in Lehrer-Quizzes)</SelectItem>
                  {subjectLevels.map((lvl) => (
                    <SelectItem key={lvl.level_number} value={lvl.level_number.toString()}>
                      Level {lvl.level_number}: {lvl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose a level to directly map these questions to that card's level in the mobile app tree.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publishing…' : 'Confirm publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
