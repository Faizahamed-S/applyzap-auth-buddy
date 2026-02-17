import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, X, Briefcase } from 'lucide-react';
import { ProfileExperience } from '@/types/user';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface ExperienceSectionProps {
  experiences: ProfileExperience[];
  onChange: (experiences: ProfileExperience[]) => void;
}

const ExperienceSection = ({ experiences, onChange }: ExperienceSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<(ProfileExperience & { _id: string })[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const withIds = (items: ProfileExperience[]) =>
    items.map((e, i) => ({ ...e, _id: `exp-${i}-${Date.now()}` }));

  const startEdit = () => {
    setDraft(withIds(experiences));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft.map(({ _id, ...rest }) => rest));
    setEditing(false);
  };

  const addExperience = () => {
    setDraft(prev => [...prev, { title: '', company: '', description: '', startDate: '', endDate: '', _id: `exp-new-${Date.now()}` }]);
  };

  const updateField = (index: number, field: keyof ProfileExperience, value: string) => {
    setDraft(prev => prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (index: number) => {
    setDraft(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraft(prev => {
        const oldIndex = prev.findIndex(e => e._id === active.id);
        const newIndex = prev.findIndex(e => e._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Experience</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-white/60 hover:text-white hover:bg-white/10">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addExperience} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
              <Plus className="mr-1 h-4 w-4" /> Add
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
      <CardContent className="space-y-4">
        {!editing && experiences.length === 0 && (
          <div className="text-center py-6 text-white/40">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No experience entries yet</p>
          </div>
        )}
        {editing ? (
          draft.length === 0 ? (
            <div className="text-center py-6 text-white/40">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No experience entries yet</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={draft.map(e => e._id)} strategy={verticalListSortingStrategy}>
                {draft.map((exp, index) => (
                  <SortableItem key={exp._id} id={exp._id}>
                    <div className="rounded-lg border border-white/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-xs font-medium">Entry {index + 1}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => removeExperience(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">Title</Label>
                          <Input value={exp.title} onChange={(e) => updateField(index, 'title', e.target.value)} placeholder="Software Engineer" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">Company</Label>
                          <Input value={exp.company} onChange={(e) => updateField(index, 'company', e.target.value)} placeholder="Google" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">Start Date</Label>
                          <Input value={exp.startDate || ''} onChange={(e) => updateField(index, 'startDate', e.target.value)} placeholder="e.g. Jan 2023" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-white/60 text-xs">End Date</Label>
                          <Input value={exp.endDate || ''} onChange={(e) => updateField(index, 'endDate', e.target.value)} placeholder="e.g. Present" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Description</Label>
                        <Textarea value={exp.description} onChange={(e) => updateField(index, 'description', e.target.value)} placeholder="Describe your role..." className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[80px] resize-none" />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          )
        ) : (
          experiences.map((exp, index) => (
            <div key={index} className="rounded-lg border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{exp.title || 'Untitled'}</h4>
                {(exp.startDate || exp.endDate) && (
                  <span className="text-white/40 text-xs">
                    {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                  </span>
                )}
              </div>
              <p className="text-electric-blue text-sm">{exp.company || '—'}</p>
              {exp.description && <p className="text-white/60 text-sm">{exp.description}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceSection;
