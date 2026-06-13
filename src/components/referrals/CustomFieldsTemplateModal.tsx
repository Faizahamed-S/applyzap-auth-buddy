import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useReferralTemplate, useUpdateReferralTemplate } from '@/hooks/useReferrals';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export const CustomFieldsTemplateModal = ({ open, onOpenChange }: Props) => {
  const { data: template } = useReferralTemplate();
  const update = useUpdateReferralTemplate();
  const [fields, setFields] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    if (open) setFields(template?.fields ?? []);
  }, [open, template]);

  const addField = () => setFields((p) => [...p, { key: '', label: '' }]);

  const removeField = (i: number) => setFields((p) => p.filter((_, idx) => idx !== i));

  const updateLabel = (i: number, label: string) =>
    setFields((p) => p.map((f, idx) => (idx === i ? { label, key: toKey(label) || f.key } : f)));

  const save = async () => {
    const cleaned = fields
      .map((f) => ({ key: toKey(f.label), label: f.label.trim() }))
      .filter((f) => f.label && f.key);
    const seen = new Set<string>();
    const unique = cleaned.filter((f) => (seen.has(f.key) ? false : (seen.add(f.key), true)));
    try {
      await update.mutateAsync({ fields: unique });
      toast.success('Template saved');
      onOpenChange(false);
    } catch {
      toast.error('Could not save template');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Fields</DialogTitle>
          <DialogDescription>
            Define fields that apply to every referral (e.g. “Met At”, “Relationship Strength”).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No custom fields yet. Add one to get started.
            </p>
          )}

          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Field name (e.g. Met At)"
                value={f.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeField(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Field
          </Button>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
