import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { BarChart3, Users, Trophy, Clock } from 'lucide-react';
import type { AnalyticsSummary, ClassroomFilter, QuizResponse, QuizResultsSummary } from '@/types';
import { GRADES, SECTIONS, SUBJECTS } from '@/types';
import { analyticsApi, quizApi, resultsApi, subjectApi } from '@/services/api';
import ClassroomSelects from '@/components/ClassroomSelects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Stable: 'secondary',
  Improving: 'default',
  'Needs review': 'destructive',
};

export default function AnalyticsPage() {
  const [classroom, setClassroom] = useState<ClassroomFilter>({
    subject: SUBJECTS[0],
    grade: GRADES[2],
    section: SECTIONS[1],
  });
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  // ── Student results state ──
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [resultsSummary, setResultsSummary] = useState<QuizResultsSummary | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Fetch published quizzes and subjects on mount
  useEffect(() => {
    subjectApi.list().then((data) => {
      const names = data.map((s) => s.name);
      setDbSubjects(names);
      if (names.length > 0) {
        setClassroom((prev) => ({ ...prev, subject: names[0] }));
      }
    }).catch(() => {});
    quizApi.list().then(setQuizzes).catch(() => {});
  }, []);

  const handleView = async () => {
    setLoading(true);
    try {
      const summary = await analyticsApi.getSummary(classroom);
      setData(summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load analytics.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async () => {
    if (!selectedQuizId) return;
    setLoadingResults(true);
    try {
      const summary = await resultsApi.getQuizResults(Number(selectedQuizId));
      setResultsSummary(summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load student results.');
      setResultsSummary(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const chartData =
    data?.topics.map((t) => ({
      name: t.topic.length > 14 ? `${t.topic.slice(0, 12)}…` : t.topic,
      accuracy: t.accuracy,
      fullName: t.topic,
    })) ?? [];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium mb-3">Analytics</p>
        <h2 className="font-serif text-3xl font-medium tracking-tight">Class performance at a glance.</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          View class analytics or check how students performed on individual quizzes.
        </p>
      </div>

      {/* ── STUDENT RESULTS SECTION ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Users size={16} />
            <CardDescription className="text-primary font-medium m-0">Live results</CardDescription>
          </div>
          <CardTitle className="text-xl">Student quiz results</CardTitle>
          <CardDescription>Select a published quiz to see who took it and how they scored.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a quiz…" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((q) => (
                    <SelectItem key={q.id} value={String(q.id)}>
                      {q.title} — {q.subject} · {q.grade}
                    </SelectItem>
                  ))}
                  {quizzes.length === 0 && (
                    <SelectItem value="none" disabled>
                      No quizzes published yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleViewResults} disabled={!selectedQuizId || loadingResults}>
              {loadingResults ? 'Loading…' : 'View results'}
            </Button>
          </div>

          {loadingResults && (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          )}

          {resultsSummary && !loadingResults && (
            <div className="mt-6 space-y-4">
              {/* Summary cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={14} />
                    <span className="text-xs">Attempts</span>
                  </div>
                  <p className="mt-1 text-2xl font-medium tabular-nums">{resultsSummary.total_attempts}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy size={14} />
                    <span className="text-xs">Average score</span>
                  </div>
                  <p className="mt-1 text-2xl font-medium tabular-nums">{Math.round(resultsSummary.average_score)}%</p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 size={14} />
                    <span className="text-xs">Quiz</span>
                  </div>
                  <p className="mt-1 text-sm font-medium truncate">{resultsSummary.quiz_title}</p>
                </div>
              </div>

              {resultsSummary.results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No students have taken this quiz yet.</p>
              ) : (
                <div className="divide-y divide-border rounded-lg border overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Student</span>
                    <span>Score</span>
                    <span>Correct</span>
                    <span>Completed</span>
                  </div>
                  {/* Table rows */}
                  {resultsSummary.results.map((r) => (
                    <div key={r.id} className="grid grid-cols-4 gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                      <span className="font-medium truncate">{r.student_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium">{Math.round(r.score)}%</span>
                        <Badge variant={r.score >= 70 ? 'default' : r.score >= 40 ? 'secondary' : 'destructive'}>
                          {r.score >= 70 ? '✓' : r.score >= 40 ? '~' : '✗'}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {r.correct_answers}/{r.total_questions}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(r.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ── CLASS ANALYTICS SECTION (existing) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class analytics</CardTitle>
          <CardDescription>Choose subject, grade, and section</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassroomSelects values={classroom} onChange={setClassroom} subjectsList={dbSubjects} />
          <Button className="mt-6" onClick={handleView} disabled={loading}>
            {loading ? 'Loading…' : 'View analytics'}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !data && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 size={32} className="text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a class and tap View analytics to see how students are performing.
            </p>
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            {data.subject} · {data.grade} · {data.section}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Average score', value: `${Math.round(data.avg_score)}%` },
              { label: 'Completion rate', value: `${Math.round(data.completion_rate)}%` },
              { label: 'Students', value: data.students_count.toString() },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topic accuracy</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      formatter={(value) => [`${value ?? 0}%`, 'Accuracy']}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as { fullName?: string } | undefined)?.fullName ?? ''
                      }
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                      }}
                    />
                    <Bar dataKey="accuracy" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topics</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {data.topics.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="font-medium">{topic.topic}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[topic.status] ?? 'outline'}>{topic.status}</Badge>
                    <span className="text-sm tabular-nums text-muted-foreground w-12 text-right">
                      {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
