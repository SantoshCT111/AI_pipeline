import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { analyticsApi, quizApi, announcementsApi, subjectApi } from '@/services/api';
import { formatRelativeTime } from '@/lib/format';

const quickActions = [
  {
    id: 'quiz-erstellen',
    label: 'Neues Quiz erstellen',
    description: 'Aus einer PDF oder einem Text ein Quiz mit KI erzeugen.',
    icon: Wand2,
    to: '/forge',
    accent: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/40',
  },
  {
    id: 'auswertung-anzeigen',
    label: 'Auswertung anzeigen',
    description: 'Sehen, wie Schüler abgeschnitten haben.',
    icon: BarChart3,
    to: '/analytics',
    accent: 'bg-emerald-50 text-emerald-700',
    border: 'hover:border-emerald-300',
  },
  {
    id: 'faecher-verwalten',
    label: 'Fächer verwalten',
    description: 'Lehrplan aufbauen und organisieren.',
    icon: BookOpen,
    to: '/subjects',
    accent: 'bg-amber-50 text-amber-700',
    border: 'hover:border-amber-300',
  },
  {
    id: 'nachricht-senden',
    label: 'Nachricht senden',
    description: 'Mit Schülern und Eltern kommunizieren.',
    icon: MessageSquare,
    to: '/comms',
    accent: 'bg-sky-50 text-sky-700',
    border: 'hover:border-sky-300',
  },
];

interface MetricData {
  activeStudents: string;
  quizzesCreated: string;
  avgScore: string;
  completionRate: string;
}

interface ActivityItem {
  id: string;
  icon: typeof Sparkles;
  label: string;
  time: string;
  accent: string;
}

export default function HomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Guten Morgen' : hour < 17 ? 'Guten Tag' : 'Guten Abend';

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricData, setMetricData] = useState<MetricData>({
    activeStudents: '—',
    quizzesCreated: '—',
    avgScore: '—',
    completionRate: '—',
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Fetch real metrics from multiple sources
    const fetchMetrics = async () => {
      try {
        const [quizzes, announcements, subjects] = await Promise.all([
          quizApi.list(),
          announcementsApi.list(),
          subjectApi.list(),
        ]);

        // Try to get analytics for the first available subject
        let avgScore = 0;
        let completionRate = 0;
        let studentsCount = 0;

        if (subjects.length > 0) {
          try {
            const summary = await analyticsApi.getSummary({
              subject: subjects[0].name,
              grade: '8',
              section: 'B',
            });
            avgScore = summary.avg_score;
            completionRate = summary.completion_rate;
            studentsCount = summary.students_count;
          } catch {
            // Analytics may not have data for this combination
          }
        }

        setMetricData({
          activeStudents: studentsCount > 0 ? studentsCount.toString() : '—',
          quizzesCreated: quizzes.length.toString(),
          avgScore: avgScore > 0 ? `${Math.round(avgScore)}%` : '—',
          completionRate: completionRate > 0 ? `${Math.round(completionRate)}%` : '—',
        });

        // Build real activity feed from quizzes and announcements
        const activities: ActivityItem[] = [];

        // Add recent quizzes
        quizzes.slice(0, 3).forEach((q, i) => {
          activities.push({
            id: `quiz-${q.id}`,
            icon: Sparkles,
            label: `Quiz „${q.title}" erstellt (${q.subject} · ${q.grade})`,
            time: formatRelativeTime(q.created_at),
            accent: 'text-primary bg-primary/10',
          });
        });

        // Add recent announcements
        announcements.slice(0, 2).forEach((a) => {
          activities.push({
            id: `ann-${a.id}`,
            icon: MessageSquare,
            label: `Ankündigung „${a.title}" gesendet`,
            time: formatRelativeTime(a.created_at),
            accent: 'text-sky-700 bg-sky-50',
          });
        });

        // Sort by recency (already sorted from API) and take top 4
        setRecentActivity(activities.slice(0, 4));
      } catch {
        // Keep defaults on error
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const metrics = [
    { id: 'aktive-schueler',   label: 'Aktive Schüler',   value: metricData.activeStudents, icon: Users },
    { id: 'quizze-erstellt',   label: 'Quizze erstellt',   value: metricData.quizzesCreated, icon: Sparkles },
    { id: 'durchschnittsnote', label: 'Ø Ergebnis',        value: metricData.avgScore, icon: TrendingUp },
    { id: 'abschlussquote',    label: 'Abschlussquote',    value: metricData.completionRate, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-14 animate-fade-in">

      {/* ── Begrüßung ─────────────────────────────────── */}
      <section aria-labelledby="startseite-ueberschrift">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-4">
          Übersicht
        </p>
        <h2
          id="startseite-ueberschrift"
          className="font-serif text-5xl font-medium tracking-tight text-foreground leading-[1.15]"
        >
          {greeting}, Lehrkraft. 👋
        </h2>
        <p className="mt-5 text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Hier ist eine Übersicht deines Arbeitsbereichs. Mach dort weiter, wo du aufgehört hast.
        </p>
      </section>

      {/* ── Systemübersicht ───────────────────────────── */}
      <section aria-labelledby="kennzahlen-ueberschrift">
        <h3
          id="kennzahlen-ueberschrift"
          className="text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-6"
        >
          Systemübersicht
        </h3>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {metrics.map(({ id, label, value, icon: Icon }) => (
            <Card key={id} className="group relative overflow-hidden">
              <CardContent className="p-7">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                </div>
                {metricsLoading ? (
                  <Skeleton className="h-10 w-20 mb-1" />
                ) : (
                  <p className="font-serif text-4xl font-medium text-foreground mb-1">{value}</p>
                )}
                <p className="text-base text-muted-foreground font-medium">{label}</p>
              </CardContent>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Schnellzugriff + Letzte Aktivitäten ──────── */}
      <div className="grid gap-10 lg:grid-cols-5">

        {/* Schnellzugriff */}
        <section aria-labelledby="schnellzugriff-ueberschrift" className="lg:col-span-3">
          <h3
            id="schnellzugriff-ueberschrift"
            className="text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-6"
          >
            Schnellzugriff
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {quickActions.map(({ id, label, description, icon: Icon, to, accent, border }) => (
              <Link
                key={id}
                to={to}
                id={id}
                className={cn(
                  'group flex items-start gap-5 rounded-2xl border-2 border-border bg-card p-7',
                  'hover:shadow-lg transition-all duration-200',
                  border,
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <div className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
                  accent,
                )}>
                  <Icon size={26} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {label}
                  </p>
                  <p className="mt-2 text-base text-muted-foreground leading-snug">{description}</p>
                </div>
                <ArrowRight
                  size={20}
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Letzte Aktivitäten */}
        <section aria-labelledby="aktivitaet-ueberschrift" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3
              id="aktivitaet-ueberschrift"
              className="text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold"
            >
              Letzte Aktivitäten
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-base text-muted-foreground hover:text-foreground px-3 py-2 h-auto"
              asChild
            >
              <Link to="/analytics">Alle anzeigen</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {metricsLoading && [1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-5">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              {!metricsLoading && recentActivity.length === 0 && (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                  Noch keine Aktivitäten vorhanden.
                </div>
              )}
              {!metricsLoading && recentActivity.map(({ id, icon: Icon, label, time, accent }) => (
                <div key={id} className="flex items-start gap-4 px-6 py-5">
                  <div className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    accent,
                  )}>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-foreground leading-snug">{label}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                      <Clock size={13} aria-hidden="true" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ── KI-Werkzeug Hinweis ───────────────────────── */}
      <section aria-label="KI-Werkzeug Hinweis">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8 p-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Zap size={18} aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-wider">KI-gestützt</span>
              </div>
              <h3 className="font-serif text-3xl font-medium text-foreground mb-3">
                Bereit für dein nächstes Quiz?
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Lade eine Lektion als PDF hoch oder füge deinen Text ein – die KI erstellt
                in Sekunden ein fertiges Quiz für deine Klasse.
              </p>
            </div>
            <Button asChild id="hinweis-ki-werkzeug" size="lg" className="shrink-0 text-lg px-8 py-6 h-auto">
              <Link to="/forge">
                <Wand2 size={20} aria-hidden="true" />
                KI-Werkzeug öffnen
              </Link>
            </Button>
          </div>
        </Card>
      </section>

    </div>
  );
}
