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
import { cn } from '@/lib/utils';

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

const metrics = [
  { id: 'aktive-schueler',   label: 'Aktive Schüler',   value: '—', icon: Users },
  { id: 'quizze-erstellt',   label: 'Quizze erstellt',   value: '—', icon: Sparkles },
  { id: 'durchschnittsnote', label: 'Ø Ergebnis',        value: '—', icon: TrendingUp },
  { id: 'abschlussquote',    label: 'Abschlussquote',    value: '—', icon: CheckCircle2 },
];

const recentActivity = [
  {
    id: 'akt-1',
    icon: Sparkles,
    label: 'Quiz aus „Kapitel 5 – Photosynthese.pdf" erstellt',
    time: 'vor 2 Min.',
    accent: 'text-primary bg-primary/10',
  },
  {
    id: 'akt-2',
    icon: BarChart3,
    label: '24 Schüler haben „Sprache · Stufe 3" abgeschlossen',
    time: 'vor 1 Std.',
    accent: 'text-emerald-700 bg-emerald-50',
  },
  {
    id: 'akt-3',
    icon: BookOpen,
    label: 'Neues Fach „Kunst" zum Lehrplan hinzugefügt',
    time: 'vor 3 Std.',
    accent: 'text-amber-700 bg-amber-50',
  },
  {
    id: 'akt-4',
    icon: MessageSquare,
    label: 'Nachricht an Klasse 8 – Gruppe B gesendet',
    time: 'Gestern',
    accent: 'text-sky-700 bg-sky-50',
  },
];

export default function HomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Guten Morgen' : hour < 17 ? 'Guten Tag' : 'Guten Abend';

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
                <p className="font-serif text-4xl font-medium text-foreground mb-1">{value}</p>
                <p className="text-base text-muted-foreground font-medium">{label}</p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  Live-Daten folgen bald
                </p>
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
              {recentActivity.map(({ id, icon: Icon, label, time, accent }) => (
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
