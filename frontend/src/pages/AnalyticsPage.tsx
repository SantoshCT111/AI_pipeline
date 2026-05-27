import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';
import type { AnalyticsSummary, ClassroomFilter } from '@/types';
import { GRADES, SECTIONS, SUBJECTS } from '@/types';
import { analyticsApi } from '@/services/api';
import ClassroomSelects from '@/components/ClassroomSelects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);

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
          Select a class to see accuracy, completion, and topics that need attention.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
          <CardDescription>Choose subject, grade, and section</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassroomSelects values={classroom} onChange={setClassroom} />
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
