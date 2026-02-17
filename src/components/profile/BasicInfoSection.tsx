import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X } from 'lucide-react';

interface BasicInfoSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  onChange: (fields: { firstName?: string; lastName?: string; timezone?: string }) => void;
}

const BasicInfoSection = ({ firstName, lastName, email, timezone, onChange }: BasicInfoSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName, lastName, timezone });

  const startEdit = () => {
    setDraft({ firstName, lastName, timezone });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft);
    setEditing(false);
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
              Done
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
