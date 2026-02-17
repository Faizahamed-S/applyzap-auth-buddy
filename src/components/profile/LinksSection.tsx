import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Plus, Trash2, ExternalLink } from 'lucide-react';
import { ProfileLink } from '@/types/user';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface LinksSectionProps {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}

type DraftLink = ProfileLink & { _id: string };

const LinksSection = ({ links, onChange }: LinksSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftLink[]>([]);
  const idCounter = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const makeId = () => `link-${++idCounter.current}`;

  const startEdit = () => {
    setDraft(links.map(l => ({ ...l, _id: makeId() })));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft.filter(l => l.label.trim() && l.url.trim()).map(({ _id, ...rest }) => rest));
    setEditing(false);
  };

  const addLink = () => {
    setDraft(prev => [...prev, { label: '', url: '', _id: makeId() }]);
  };

  const updateLink = (id: string, key: 'label' | 'url', value: string) => {
    setDraft(prev => prev.map(l => l._id === id ? { ...l, [key]: value } : l));
  };

  const removeLink = (id: string) => {
    setDraft(prev => prev.filter(l => l._id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraft(prev => {
        const oldIndex = prev.findIndex(l => l._id === active.id);
        const newIndex = prev.findIndex(l => l._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Links</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-white/60 hover:text-white hover:bg-white/10">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addLink} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
              <Plus className="mr-1 h-4 w-4" /> Add Link
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-white/60 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmEdit} className="bg-electric-blue hover:bg-blue-700 text-white">
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          draft.length === 0 ? (
            <p className="text-white/40 text-sm">No links yet. Click "Add Link" to add one.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={draft.map(l => l._id)} strategy={verticalListSortingStrategy}>
                {draft.map((link) => (
                  <SortableItem key={link._id} id={link._id}>
                    <div className="flex gap-2 items-start">
                      <Input value={link.label} onChange={(e) => updateLink(link._id, 'label', e.target.value)} placeholder="Label (e.g. GitHub)" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 w-1/3" />
                      <Input value={link.url} onChange={(e) => updateLink(link._id, 'url', e.target.value)} placeholder="https://..." className="bg-white/10 border-white/20 text-white placeholder:text-white/30 flex-1" />
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => removeLink(link._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          )
        ) : links.length === 0 ? (
          <p className="text-white/40 text-sm">No links added yet</p>
        ) : (
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-white/50 shrink-0" />
                <span className="text-white/60 text-sm">{link.label}:</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline text-sm truncate">
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinksSection;
