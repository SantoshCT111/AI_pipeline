import { useEffect, useState, useRef } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { BarChart3, Users, Trophy, Sparkles, Send, Bot, User, Clock } from 'lucide-react';
import type { AnalyticsSummary, ClassroomFilter, QuizResponse } from '@/types';
import { GRADES, SECTIONS, SUBJECTS } from '@/types';
import { analyticsApi, quizApi, subjectApi, aiChatApi } from '@/services/api';
import type { AIChatMessage, AnalyticsContext } from '@/services/api';
import ClassroomSelects from '@/components/ClassroomSelects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Stable: 'secondary',
  Improving: 'default',
  'Needs review': 'destructive',
};

const statusLabel: Record<string, string> = {
  Stable: 'Stabil',
  Improving: 'Verbessernd',
  'Needs review': 'Überprüfen',
};

// Quick prompt suggestions for the AI chat
const CHAT_SUGGESTIONS = [
  'Welche Themen fielen am schwersten?',
  'Wer braucht zusätzliche Hilfe?',
  'Wie war die Beteiligung beim letzten Quiz?',
];

export default function AnalyticsPage() {
  const [classroom, setClassroom] = useState<ClassroomFilter>({
    subject: SUBJECTS[0],
    grade: GRADES[2],
    section: SECTIONS[1],
  });
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [classQuizzes, setClassQuizzes] = useState<QuizResponse[]>([]);

  // AI Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hallo! Ich habe die Leistungsdaten analysiert. Frag mich gerne, falls du bestimmte Details brauchst.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    subjectApi.list().then((res) => {
      const names = res.map((s) => s.name);
      setDbSubjects(names);
      if (names.length > 0) {
        setClassroom((prev) => ({ ...prev, subject: names[0] }));
      }
    }).catch(() => {});
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      // Fetch both summary and quiz list for this class
      const [summary, allQuizzes] = await Promise.all([
        analyticsApi.getSummary(classroom),
        quizApi.list()
      ]);
      setData(summary);
      
      // Filter quizzes to match current classroom selection
      const filteredQuizzes = allQuizzes.filter(q => 
        q.subject.toLowerCase() === classroom.subject.toLowerCase() &&
        q.grade === classroom.grade &&
        q.section === classroom.section
      );
      setClassQuizzes(filteredQuizzes);

      // Give a proactive AI insight if data is loaded
      if (summary.topics.some(t => t.status === 'Needs review')) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', content: `Ich sehe, dass das Thema "${summary.topics.find(t => t.status === 'Needs review')?.topic}" besondere Aufmerksamkeit benötigt. Soll ich Übungsfragen dazu generieren?` }
        ]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.');
      setData(null);
      setClassQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Build analytics context from current data
      const analyticsContext: AnalyticsContext = {
        subject: classroom.subject,
        grade: classroom.grade,
        section: classroom.section,
        avg_score: data?.avg_score ?? 0,
        completion_rate: data?.completion_rate ?? 0,
        students_count: data?.students_count ?? 0,
        topics: data?.topics.map(t => ({ topic: t.topic, accuracy: t.accuracy, status: t.status })) ?? [],
        recent_quizzes: classQuizzes.map(q => ({
          title: q.title,
          level_number: q.level_number ?? null,
          created_at: q.created_at,
        })),
      };

      // Build history (exclude the initial greeting)
      const history: AIChatMessage[] = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await aiChatApi.send(content, 'analytics', history, analyticsContext);
      setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Entschuldigung, es gab einen Fehler bei der Verbindung zur KI. Bitte versuche es erneut.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const chartData = data?.topics.map((t) => ({
    name: t.topic.length > 14 ? `${t.topic.slice(0, 12)}…` : t.topic,
    accuracy: t.accuracy,
    fullName: t.topic,
  })) ?? [];

  return (
    <div className="animate-fade-in w-full pb-52 relative">
      
      {/* ── TOP: DASHBOARD ── */}
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Auswertung</p>
          <h2 className="font-serif text-5xl font-medium tracking-tight">Klassenleistung.</h2>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Wähle eine Klasse aus, um alle Metriken, Quizergebnisse und Themenauswertungen zentral zu sehen.
          </p>
        </div>

        {/* Filter Panel */}
        <Card className="bg-muted/30 border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <ClassroomSelects values={classroom} onChange={setClassroom} subjectsList={dbSubjects} />
              </div>
              <Button onClick={handleFetchData} disabled={loading} size="lg" className="w-full sm:w-auto text-base h-[52px]">
                {loading ? 'Lädt …' : 'Daten abrufen'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {!loading && !data && (
          <Card className="border-dashed bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 size={40} className="text-muted-foreground mb-4 opacity-50" />
              <p className="text-base text-muted-foreground max-w-sm">
                Keine Daten ausgewählt. Bitte wähle Fach, Klasse und Gruppe und klicke auf "Daten abrufen".
              </p>
            </CardContent>
          </Card>
        )}

        {data && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Top KPIs */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Durchschnitt', value: `${Math.round(data.avg_score)}%`, icon: Trophy },
                { label: 'Abschlussquote', value: `${Math.round(data.completion_rate)}%`, icon: BarChart3 },
                { label: 'Schüler', value: data.students_count.toString(), icon: Users },
              ].map((stat) => (
                <Card key={stat.label} className="border-2 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <stat.icon size={16} />
                      <p className="text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                    </div>
                    <p className="font-serif text-4xl font-medium tabular-nums">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts & Topics Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Chart */}
              {chartData.length > 0 && (
                <Card className="border-2 shadow-sm flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Themengenauigkeit</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value) => [`${value ?? 0}%`, 'Genauigkeit']}
                          labelFormatter={(_, payload) => (payload?.[0]?.payload as { fullName?: string } | undefined)?.fullName ?? ''}
                          contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                          cursor={{ fill: 'var(--muted)' }}
                        />
                        <Bar dataKey="accuracy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Topics List */}
              <Card className="border-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Themenübersicht</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-[250px] px-4 overflow-y-auto scrollbar-thin">
                    <div className="divide-y divide-border">
                      {data.topics.map((topic) => (
                        <div key={topic.topic} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                          <span className="font-medium text-sm">{topic.topic}</span>
                          <div className="flex items-center gap-3">
                            <Badge variant={statusVariant[topic.status] ?? 'outline'} className="text-[10px]">
                              {statusLabel[topic.status] ?? topic.status}
                            </Badge>
                            <span className="text-sm font-semibold tabular-nums text-muted-foreground w-10 text-right">
                              {Math.round(topic.accuracy)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Quizzes for this class */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kürzlich durchgeführte Quizze</CardTitle>
                <CardDescription>Übersicht der Quizze, die dieser Klasse zugewiesen wurden.</CardDescription>
              </CardHeader>
              <CardContent>
                {classQuizzes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg">
                    Keine Quizze für diese Klasse gefunden.
                  </div>
                ) : (
                  <div className="divide-y divide-border border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-6">Quiz Titel</div>
                      <div className="col-span-3">Stufe</div>
                      <div className="col-span-3 text-right">Datum</div>
                    </div>
                    {classQuizzes.map((q) => (
                      <div key={q.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-muted/10 transition-colors">
                        <div className="col-span-6 font-medium truncate">{q.title}</div>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {q.level_number ? `Stufe ${q.level_number}` : 'Global'}
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground text-right flex justify-end items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(q.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── MIDDLE: CHAT HISTORY ── */}
      <div className="mt-20 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">KI-Auswertung</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Frag mich zur Klasse</p>
          </div>
        </div>

        <div className="space-y-6 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`px-5 py-4 rounded-3xl text-[15px] max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-muted/30 border rounded-tl-none leading-relaxed'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="px-5 py-4 rounded-3xl bg-muted/30 border rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      {/* ── BOTTOM: FIXED INPUT ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[288px] bg-background/80 backdrop-blur-xl border-t p-4 z-40">
        <div className="max-w-7xl mx-auto px-10">
          {/* Suggestions */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none snap-x">
            {CHAT_SUGGESTIONS.map((sug, i) => (
              <button 
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 snap-start px-4 py-2 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-full transition-colors whitespace-nowrap text-foreground"
              >
                {sug}
              </button>
            ))}
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
            className="relative flex items-center"
          >
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Frag die KI zur Auswertung dieser Klasse …"
              className="pr-14 h-14 bg-card border-2 shadow-sm focus-visible:border-primary focus-visible:ring-1 rounded-2xl text-base"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="default" 
              className="absolute right-1.5 w-11 h-11 rounded-xl disabled:opacity-50"
              disabled={!chatInput.trim() || chatLoading}
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
