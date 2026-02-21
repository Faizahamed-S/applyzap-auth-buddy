import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Plus, Trash2 } from 'lucide-react';
import { BasicInfoExtraField } from '@/types/user';

interface BasicInfoSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  extraFields: BasicInfoExtraField[];
  onChange: (fields: { firstName?: string; lastName?: string; timezone?: string }) => void;
  onExtraFieldsChange: (fields: BasicInfoExtraField[]) => void;
}

const BasicInfoSection = ({ firstName, lastName, email, timezone, extraFields, onChange, onExtraFieldsChange }: BasicInfoSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName, lastName, timezone });
  const [draftExtra, setDraftExtra] = useState<BasicInfoExtraField[]>(extraFields);

  const startEdit = () => {
    setDraft({ firstName, lastName, timezone });
    setDraftExtra(extraFields.map(f => ({ ...f })));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft);
    onExtraFieldsChange(draftExtra.filter(f => f.label.trim() || f.value.trim()));
    setEditing(false);
  };

  const addExtraField = () => {
    setDraftExtra(prev => [...prev, { label: '', value: '' }]);
  };

  const updateExtraField = (index: number, key: 'label' | 'value', val: string) => {
    setDraftExtra(prev => prev.map((f, i) => i === index ? { ...f, [key]: val } : f));
  };

  const removeExtraField = (index: number) => {
    setDraftExtra(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Basic Information</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
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
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">First Name</Label>
                <Input value={draft.firstName} onChange={(e) => setDraft(d => ({ ...d, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Name</Label>
                <Input value={draft.lastName} onChange={(e) => setDraft(d => ({ ...d, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input value={email} disabled className="opacity-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Timezone</Label>
              <Input value={draft.timezone} onChange={(e) => setDraft(d => ({ ...d, timezone: e.target.value }))} placeholder="e.g. America/New_York" />
            </div>

            {/* Extra custom fields */}
            {draftExtra.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="text-muted-foreground text-xs font-medium">Additional Fields</span>
                {draftExtra.map((field, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input value={field.label} onChange={(e) => updateExtraField(i, 'label', e.target.value)} placeholder="Label (e.g. Phone)" className="w-1/3" />
                    <Input value={field.value} onChange={(e) => updateExtraField(i, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0" onClick={() => removeExtraField(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={addExtraField}>
              <Plus className="mr-1 h-4 w-4" /> Add Field
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-xs">First Name</span>
                <p className="text-foreground">{firstName || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Last Name</span>
                <p className="text-foreground">{lastName || '—'}</p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Email</span>
              <p className="text-muted-foreground">{email}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Timezone</span>
              <p className="text-foreground">{timezone || '—'}</p>
            </div>
            {extraFields.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                {extraFields.map((field, i) => (
                  <div key={i}>
                    <span className="text-muted-foreground text-xs">{field.label}</span>
                    <p className="text-foreground">{field.value || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
