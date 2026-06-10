import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, Layers, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { subjectApi } from '@/services/api';
import type { Subject } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditLevelsOpen, setIsEditLevelsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📝');
  const [newColor, setNewColor] = useState('#1CB0F6');
  const [newShadowColor, setNewShadowColor] = useState('#1480B3');
  const [newLevelProgress, setNewLevelProgress] = useState(1);
  const [newLevels, setNewLevels] = useState<{ title: string }[]>([
    { title: 'Stufe 1 Einführung' }
  ]);

  const [editLevelsList, setEditLevelsList] = useState<{ title: string }[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectApi.list();
      setSubjects(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fächer konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevelInput = () => {
    setNewLevels([...newLevels, { title: `Stufe ${newLevels.length + 1}` }]);
  };

  const handleRemoveLevelInput = (idx: number) => {
    setNewLevels(newLevels.filter((_, i) => i !== idx));
  };

  const handleLevelTitleChange = (idx: number, title: string) => {
    const updated = [...newLevels];
    updated[idx].title = title;
    setNewLevels(updated);
  };

  const handleCreateSubject = async () => {
    if (!newName.trim()) {
      toast.error('Bitte einen Fachnamen eingeben.');
      return;
    }
    if (newLevels.some(l => !l.title.trim())) {
      toast.error('Alle Stufen müssen einen Titel haben.');
      return;
    }

    try {
      const formattedLevels = newLevels.map((l, index) => ({
        title: l.title.trim(),
        is_unlocked: index + 1 <= newLevelProgress,
        is_completed: index + 1 < newLevelProgress,
        stars: index + 1 < newLevelProgress ? 3 : 0,
      }));

      await subjectApi.create({
        name: newName.trim(),
        emoji: newEmoji.trim(),
        color: newColor,
        shadow_color: newShadowColor,
        level: newLevelProgress,
        levels: formattedLevels,
      });

      toast.success(`Fach „${newName}" erfolgreich erstellt!`);
      setIsAddOpen(false);
      resetAddForm();
      fetchSubjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fach konnte nicht erstellt werden.');
    }
  };

  const resetAddForm = () => {
    setNewName('');
    setNewEmoji('📝');
    setNewColor('#1CB0F6');
    setNewShadowColor('#1480B3');
    setNewLevelProgress(1);
    setNewLevels([{ title: 'Stufe 1 Einführung' }]);
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!window.confirm(`Sicher, dass du „${name}" löschen möchtest? Alle zugehörigen Quizze und der Lernfortschritt werden entfernt.`)) {
      return;
    }
    try {
      await subjectApi.delete(id);
      toast.success(`Fach „${name}" gelöscht.`);
      fetchSubjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fach konnte nicht gelöscht werden.');
    }
  };

  const handleOpenEditLevels = (subj: Subject) => {
    setSelectedSubject(subj);
    setEditLevelsList(subj.levels.map(l => ({ title: l.title })));
    setIsEditLevelsOpen(true);
  };

  const handleAddEditLevelInput = () => {
    setEditLevelsList([...editLevelsList, { title: `Neue Stufe ${editLevelsList.length + 1}` }]);
  };

  const handleRemoveEditLevelInput = (idx: number) => {
    setEditLevelsList(editLevelsList.filter((_, i) => i !== idx));
  };

  const handleEditLevelTitleChange = (idx: number, title: string) => {
    const updated = [...editLevelsList];
    updated[idx].title = title;
    setEditLevelsList(updated);
  };

  const handleSaveLevels = async () => {
    if (!selectedSubject) return;
    if (editLevelsList.some(l => !l.title.trim())) {
      toast.error('Alle Stufen müssen einen Titel haben.');
      return;
    }

    try {
      const formattedLevels = editLevelsList.map((l, index) => ({
        title: l.title.trim(),
        is_unlocked: index + 1 <= selectedSubject.level,
        is_completed: index + 1 < selectedSubject.level,
        stars: index + 1 < selectedSubject.level ? 3 : 0,
      }));

      await subjectApi.updateLevels(selectedSubject.id, formattedLevels);
      toast.success('Stufen erfolgreich aktualisiert!');
      setIsEditLevelsOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stufen konnten nicht aktualisiert werden.');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Lehrplan</p>
          <h2 className="font-serif text-5xl font-medium tracking-tight text-foreground leading-tight">
            Fächer &amp; Stufen
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl">
            Fächer und Lernpfade verwalten, die in der mobilen App angezeigt werden.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 flex items-center gap-2">
              <Plus size={16} /> Fach hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                Neues Fach hinzufügen
              </DialogTitle>
              <DialogDescription>
                Neuen Lehrplan erstellen. Farben festlegen und einen eigenen Stufenpfad aufbauen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="z. B. Musik" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emoji">Emoji-Symbol</Label>
                  <Input id="emoji" placeholder="z. B. 🎵" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Hauptfarbe (Hex)</Label>
                  <div className="flex gap-2">
                    <Input id="color" type="color" className="w-12 h-9 p-1 shrink-0" value={newColor} onChange={e => setNewColor(e.target.value)} />
                    <Input placeholder="#1CB0F6" value={newColor} onChange={e => setNewColor(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shadow-color">Schattenfarbe (Hex)</Label>
                  <div className="flex gap-2">
                    <Input id="shadow-color" type="color" className="w-12 h-9 p-1 shrink-0" value={newShadowColor} onChange={e => setNewShadowColor(e.target.value)} />
                    <Input placeholder="#1480B3" value={newShadowColor} onChange={e => setNewShadowColor(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active-level">Lernziel-Stufe für Schüler</Label>
                <Input id="active-level" type="number" min="1" max={newLevels.length} value={newLevelProgress} onChange={e => setNewLevelProgress(Math.max(1, Math.min(newLevels.length, parseInt(e.target.value) || 1)))} />
                <span className="text-[11px] text-muted-foreground block">
                  Schüler werden bis zu dieser Stufe freigeschaltet.
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1"><Layers size={14} /> Stufenbaum-Knoten</Label>
                  <Button variant="outline" size="sm" onClick={handleAddLevelInput}>
                    + Knoten hinzufügen
                  </Button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto border rounded-lg p-3 bg-muted/20">
                  {newLevels.map((lvl, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-xs font-mono font-medium text-muted-foreground w-6">#{index + 1}</span>
                      <Input
                        placeholder={`z. B. Stufe ${index + 1} Thema`}
                        value={lvl.title}
                        onChange={e => handleLevelTitleChange(index, e.target.value)}
                      />
                      {newLevels.length > 1 && (
                        <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleRemoveLevelInput(index)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Abbrechen</Button>
              <Button onClick={handleCreateSubject}>Fach erstellen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 border-muted-foreground/10">
              <div className="h-44 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <Card key={subject.id} className="overflow-hidden flex flex-col justify-between" style={{ borderLeft: `5px solid ${subject.color}` }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-muted/50" style={{ border: `1px solid ${subject.color}25` }}>
                      {subject.emoji}
                    </span>
                    <div>
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      <CardDescription>
                        {subject.levels.length} Stufen festgelegt
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubject(subject.id, subject.name)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Lernziel-Stufe</span>
                    <span className="font-semibold" style={{ color: subject.color }}>Stufe {subject.level}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(subject.level / subject.levels.length) * 100}%`, backgroundColor: subject.color }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5" onClick={() => handleOpenEditLevels(subject)}>
                    <Edit size={14} /> Stufenbaum bearbeiten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stufen bearbeiten Modal */}
      <Dialog open={isEditLevelsOpen} onOpenChange={setIsEditLevelsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers size={18} style={{ color: selectedSubject?.color }} />
              Stufen bearbeiten: {selectedSubject?.name}
            </DialogTitle>
            <DialogDescription>
              Lernpfad und Stufentitel für diesen Fachbaum anpassen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <Label>Stufenreihenfolge</Label>
              <Button variant="outline" size="sm" onClick={handleAddEditLevelInput}>
                + Stufe hinzufügen
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3 bg-muted/20">
              {editLevelsList.map((lvl, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-xs font-mono font-medium text-muted-foreground w-6">#{index + 1}</span>
                  <Input
                    placeholder={`z. B. Stufe ${index + 1}`}
                    value={lvl.title}
                    onChange={e => handleEditLevelTitleChange(index, e.target.value)}
                  />
                  {editLevelsList.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleRemoveEditLevelInput(index)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLevelsOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveLevels} className="flex items-center gap-1">
              <Save size={14} /> Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
