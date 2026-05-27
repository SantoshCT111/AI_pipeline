import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import type { Announcement, AnnouncementPriority } from '@/types';
import { announcementsApi } from '@/services/api';
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

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];

const priorityBadge: Record<AnnouncementPriority, 'default' | 'secondary' | 'destructive'> = {
  Normal: 'secondary',
  Important: 'default',
  Urgent: 'destructive',
};

export default function CommsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    announcementsApi
      .list()
      .then(setAnnouncements)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load messages.'))
      .finally(() => setLoading(false));
  }, []);

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
      toast.success('Announcement sent.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium mb-3">Messages</p>
        <h2 className="font-serif text-3xl font-medium tracking-tight">Clear updates for parents.</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Write calm, scannable announcements. Preview how parents will see them before sending.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compose</CardTitle>
            <CardDescription>Draft your announcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message…"
                className="min-h-[140px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <ToggleGroup
                type="single"
                value={priority}
                onValueChange={(v) => v && setPriority(v as AnnouncementPriority)}
                className="justify-start"
              >
                {PRIORITIES.map((p) => (
                  <ToggleGroupItem key={p} value={p} className="px-4">
                    {p}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button
              onClick={handleSend}
              disabled={!title.trim() || !body.trim() || sending}
              className="w-full sm:w-auto"
            >
              <Send size={16} />
              {sending ? 'Sending…' : 'Send announcement'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Parent preview</CardTitle>
            <CardDescription>How families will see this</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-serif text-lg font-medium">
                  {title.trim() || 'Your title appears here'}
                </h3>
                <Badge variant={priorityBadge[priority]}>{priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {body.trim() || 'Your message will appear here as parents read it on their phones.'}
              </p>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">From Teacher Hub · Just now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading &&
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          {!loading && announcements.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No announcements yet.</p>
          )}
          {announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium">{item.title}</h4>
                <Badge variant={priorityBadge[item.priority as AnnouncementPriority]}>
                  {item.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(item.created_at)} · Read by {item.read_count} parents
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
