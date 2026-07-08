import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import type { Announcement, AnnouncementPriority } from '@/types';
import { announcementsApi, aiChatApi } from '@/services/api';
import type { AIChatMessage, CommsContext } from '@/services/api';
import { formatRelativeTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];

const priorityBadge: Record<AnnouncementPriority, 'default' | 'secondary' | 'destructive'> = {
  Normal: 'secondary',
  Important: 'default',
  Urgent: 'destructive',
};

const priorityLabel: Record<AnnouncementPriority, string> = {
  Normal: 'Normal',
  Important: 'Wichtig',
  Urgent: 'Dringend',
};

const CHAT_SUGGESTIONS = [
  'Fasse meine neuen Nachrichten zusammen',
  'Entwurf: Erinnerung an den Elternabend',
  'Welche Eltern haben noch nicht geantwortet?',
  'Entwurf: Bitte um Rückmeldung zum Ausflug'
];

export default function CommsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // AI Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hallo! Ich kann deine eingegangenen Elternnachrichten zusammenfassen oder dir beim Schreiben neuer Ankündigungen helfen. Was brauchst du?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    announcementsApi
      .list()
      .then(setAnnouncements)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Nachrichten konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const created = await announcementsApi.create({
        title: title.trim(),
        body: body.trim(),
        priority,
      });
      setAnnouncements((prev) => [created, ...prev]);
      setTitle('');
      setBody('');
      setPriority('Normal');
      toast.success('Ankündigung gesendet.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ankündigung konnte nicht gesendet werden.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Build comms context from current announcements
      const commsContext: CommsContext = {
        announcements: announcements.map(a => ({
          title: a.title,
          body: a.body,
          priority: a.priority,
          created_at: a.created_at,
        })),
      };

      const history: AIChatMessage[] = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await aiChatApi.send(content, 'comms', history, undefined, commsContext);
      setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);

      // If the AI generated a draft, auto-fill the compose form
      if (response.action?.type === 'draft') {
        setTitle(response.action.title);
        setBody(response.action.body);
        const p = response.action.priority as AnnouncementPriority;
        if (['Normal', 'Important', 'Urgent'].includes(p)) {
          setPriority(p);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Entschuldigung, es gab einen Fehler bei der Verbindung zur KI. Bitte versuche es erneut.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full pb-52 relative">
      
      {/* ── TOP: DASHBOARD / COMPOSER ── */}
      <div className="space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Nachrichten</p>
          <h2 className="font-serif text-5xl font-medium tracking-tight">Klare Infos für Eltern.</h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Ruhige, gut lesbare Ankündigungen schreiben. Die KI hilft dir beim Zusammenfassen und Formulieren.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Verfassen</CardTitle>
              <CardDescription>Ankündigung erstellen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel der Ankündigung"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Nachricht</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Nachricht schreiben …"
                  className="min-h-[160px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label>Priorität</Label>
                <ToggleGroup
                  type="single"
                  value={priority}
                  onValueChange={(v) => v && setPriority(v as AnnouncementPriority)}
                  className="justify-start gap-2"
                >
                  {PRIORITIES.map((p) => (
                    <ToggleGroupItem key={p} value={p} className="px-4 py-2 border h-auto data-[state=on]:bg-primary/10 data-[state=on]:border-primary/20">
                      {priorityLabel[p]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Button
                onClick={handleSend}
                disabled={!title.trim() || !body.trim() || sending}
                className="w-full h-11 mt-2"
              >
                <Send size={16} className="mr-2" />
                {sending ? 'Wird gesendet …' : 'Ankündigung senden'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-muted/30 border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Eltern-Vorschau</CardTitle>
                <CardDescription>So sehen Familien diese Nachricht</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-serif text-xl font-medium">
                        {title.trim() || 'Hier erscheint dein Titel'}
                      </h3>
                    </div>
                    <Badge variant={priorityBadge[priority]}>{priorityLabel[priority]}</Badge>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {body.trim() || 'Deine Nachricht erscheint hier, so wie Eltern sie auf dem Handy lesen.'}
                  </p>
                  <Separator className="my-5" />
                  <p className="text-sm text-muted-foreground">Von Lehrer Hub · Gerade eben</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Letzte Ankündigungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {loading && [1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
                {!loading && announcements.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">Noch keine Ankündigungen.</p>
                )}
                {announcements.map((item) => (
                  <div key={item.id} className="rounded-xl border bg-card p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-base">{item.title}</h4>
                      <Badge variant={priorityBadge[item.priority as AnnouncementPriority]} className="text-[10px]">
                        {priorityLabel[item.priority as AnnouncementPriority] ?? item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.body}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatRelativeTime(item.created_at)} · Von {item.read_count} Eltern gelesen
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: CHAT HISTORY ── */}
      <div className="mt-20 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">KI-Nachrichten-Assistenz</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Posteingang & Entwürfe</p>
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
                className="shrink-0 snap-start px-4 py-2 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-full transition-colors whitespace-nowrap text-foreground shadow-sm"
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
              placeholder="Frag die KI nach Nachrichten oder Entwürfen …"
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
