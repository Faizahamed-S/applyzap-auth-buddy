import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, X, Briefcase } from 'lucide-react';
import { ProfileExperience } from '@/types/user';

interface ExperienceSectionProps {
  experiences: ProfileExperience[];
  onChange: (experiences: ProfileExperience[]) => void;
}

const ExperienceSection = ({ experiences, onChange }: ExperienceSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileExperience[]>(experiences);

  const startEdit = () => {
    setDraft(experiences.map(e => ({ ...e })));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft);
    setEditing(false);
  };

  const addExperience = () => {
    setDraft(prev => [...prev, { title: '', company: '', description: '', startDate: '', endDate: '' }]);
  };

  const updateField = (index: number, field: keyof ProfileExperience, value: string) => {
    setDraft(prev => prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (index: number) => {
    setDraft(prev => prev.filter((_, i) => i !== index));
  };

  const displayItems = editing ? draft : experiences;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Experience</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmEdit}>
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {displayItems.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No experience entries yet</p>
          </div>
        )}
        {displayItems.map((exp, index) => (
          <div key={index} className="rounded-lg border border-border p-4 space-y-3">
            {editing ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">Entry {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10" onClick={() => removeExperience(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Title</Label>
                    <Input value={exp.title} onChange={(e) => updateField(index, 'title', e.target.value)} placeholder="Software Engineer" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Company</Label>
                    <Input value={exp.company} onChange={(e) => updateField(index, 'company', e.target.value)} placeholder="Google" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Start Date</Label>
                    <Input value={exp.startDate || ''} onChange={(e) => updateField(index, 'startDate', e.target.value)} placeholder="e.g. Jan 2023" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">End Date</Label>
                    <Input value={exp.endDate || ''} onChange={(e) => updateField(index, 'endDate', e.target.value)} placeholder="e.g. Present" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <Textarea value={exp.description} onChange={(e) => updateField(index, 'description', e.target.value)} placeholder="Describe your role..." className="min-h-[80px] resize-none" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground font-medium">{exp.title || 'Untitled'}</h4>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-muted-foreground text-xs">
                      {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate}
                    </span>
                  )}
                </div>
                <p className="text-primary text-sm">{exp.company || '—'}</p>
                {exp.description && <p className="text-muted-foreground text-sm">{exp.description}</p>}
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExperienceSection;
