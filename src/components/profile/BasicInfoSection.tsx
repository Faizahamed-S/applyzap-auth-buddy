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
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Basic Information</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-white/60 hover:text-white hover:bg-white/10">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
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
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">First Name</Label>
                <Input value={draft.firstName} onChange={(e) => setDraft(d => ({ ...d, firstName: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Last Name</Label>
                <Input value={draft.lastName} onChange={(e) => setDraft(d => ({ ...d, lastName: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Email</Label>
              <Input value={email} disabled className="bg-white/5 border-white/10 text-white/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Timezone</Label>
              <Input value={draft.timezone} onChange={(e) => setDraft(d => ({ ...d, timezone: e.target.value }))} placeholder="e.g. America/New_York" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
            </div>

            {/* Extra custom fields */}
            {draftExtra.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-white/50 text-xs font-medium">Additional Fields</span>
                {draftExtra.map((field, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input value={field.label} onChange={(e) => updateExtraField(i, 'label', e.target.value)} placeholder="Label (e.g. Phone)" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 w-1/3" />
                    <Input value={field.value} onChange={(e) => updateExtraField(i, 'value', e.target.value)} placeholder="Value" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 flex-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => removeExtraField(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={addExtraField} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
              <Plus className="mr-1 h-4 w-4" /> Add Field
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-white/50 text-xs">First Name</span>
                <p className="text-white">{firstName || '—'}</p>
              </div>
              <div>
                <span className="text-white/50 text-xs">Last Name</span>
                <p className="text-white">{lastName || '—'}</p>
              </div>
            </div>
            <div>
              <span className="text-white/50 text-xs">Email</span>
              <p className="text-white/70">{email}</p>
            </div>
            <div>
              <span className="text-white/50 text-xs">Timezone</span>
              <p className="text-white">{timezone || '—'}</p>
            </div>
            {extraFields.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                {extraFields.map((field, i) => (
                  <div key={i}>
                    <span className="text-white/50 text-xs">{field.label}</span>
                    <p className="text-white">{field.value || '—'}</p>
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
