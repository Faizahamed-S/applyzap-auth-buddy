import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDown, ArrowUp, Lock, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFieldTemplate, useUpdateFieldTemplate } from '@/hooks/useFieldTemplate';
import {
  EDITABLE_FIELD_TYPES,
  fieldTypeLabel,
  labelToKey,
  type FieldTemplateEntry,
  type FieldType,
} from '@/types/fieldTemplate';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Draft = FieldTemplateEntry & { existingKey?: string };

export const FieldTemplateModal = ({ open, onOpenChange }: Props) => {
  const { data: template, isLoading, isError } = useFieldTemplate();
  const save = useUpdateFieldTemplate();
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    if (!open) return;
    setDrafts(
      (template?.custom ?? []).map((f) => ({
        ...f,
        options: f.options ? [...f.options] : null,
        existingKey: f.key,
      })),
    );
  }, [open, template]);

  const update = (i: number, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const addField = () =>
    setDrafts((prev) => [
      ...prev,
      {
        key: '',
        label: '',
        type: 'text',
        order: prev.length,
        required: false,
        locked: false,
        options: null,
      },
    ]);

  const removeField = (i: number) => setDrafts((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= drafts.length) return;
    setDrafts((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const setOption = (i: number, oi: number, value: string) =>
    setDrafts((prev) =>
      prev.map((f, idx) =>
        idx === i
          ? { ...f, options: (f.options ?? []).map((o, k) => (k === oi ? value : o)) }
          : f,
      ),
    );

  const addOption = (i: number) =>
    setDrafts((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, options: [...(f.options ?? []), ''] } : f)),
    );

  const removeOption = (i: number, oi: number) =>
    setDrafts((prev) =>
      prev.map((f, idx) =>
        idx === i ? { ...f, options: (f.options ?? []).filter((_, k) => k !== oi) } : f,
      ),
    );

  const handleTypeChange = (i: number, type: FieldType) =>
    update(i, { type, options: type === 'select' ? (drafts[i].options ?? ['']) : null });

  const handleSave = () => {
    const builtInKeys = new Set((template?.builtIn ?? []).map((f) => f.key));
    const seen = new Set<string>();
    const cleaned: FieldTemplateEntry[] = [];

    for (const f of drafts) {
      const label = f.label.trim();
      if (!label) {
        toast.error('Every field needs a name');
        return;
      }
      const key = f.existingKey || labelToKey(label);
      if (!key) {
        toast.error(`"${label}" isn't a usable field name`);
        return;
      }
      if (builtInKeys.has(key)) {
        toast.error(`"${label}" clashes with a built-in field`);
        return;
      }
      if (seen.has(key)) {
        toast.error(`"${label}" is duplicated`);
        return;
      }
      seen.add(key);

      let options: string[] | null = null;
      if (f.type === 'select') {
        options = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
        if (options.length === 0) {
          toast.error(`Add at least one option to "${label}"`);
          return;
        }
        if (new Set(options).size !== options.length) {
          toast.error(`"${label}" has duplicate options`);
          return;
        }
      }

      cleaned.push({
        key,
        label,
        type: f.type,
        order: cleaned.length,
        required: f.required,
        locked: false,
        options,
      });
    }

    save.mutate(
      { builtIn: template?.builtIn ?? [], custom: cleaned },
      {
        onSuccess: () => {
          toast.success('Template saved');
          onOpenChange(false);
        },
        onError: () => toast.error('Could not save the template'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Application Form Template</DialogTitle>
          <DialogDescription>
            These are the fields on your Add/Edit application form. Built-in fields are fixed;
            add your own below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading template…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              Couldn't load your template. Please close and try again.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Built-in fields</Label>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {(template?.builtIn ?? []).map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{f.label}</span>
                        {f.required && (
                          <span className="text-xs text-muted-foreground">required</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {fieldTypeLabel(f.type)}
                      </span>
                    </div>
                  ))}
                  {(template?.builtIn ?? []).length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No built-in fields reported.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Your fields</Label>

                {drafts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No extra fields yet. Add one to see it on the application form.
                  </p>
                )}

                {drafts.map((f, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => move(i, 1)}
                          disabled={i === drafts.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <Input
                        value={f.label}
                        placeholder="Field name (e.g. Location)"
                        maxLength={60}
                        onChange={(e) => update(i, { label: e.target.value })}
                        className="flex-1"
                      />

                      <Select
                        value={f.type}
                        onValueChange={(v) => handleTypeChange(i, v as FieldType)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {EDITABLE_FIELD_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeField(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 pl-8">
                      <Switch
                        checked={f.required}
                        onCheckedChange={(v) => update(i, { required: v })}
                      />
                      <span className="text-sm text-muted-foreground">Required</span>
                    </div>

                    {f.type === 'select' && (
                      <div className="pl-8 space-y-2">
                        <Label className="text-xs text-muted-foreground">Options</Label>
                        {(f.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              placeholder={`Option ${oi + 1}`}
                              maxLength={60}
                              onChange={(e) => setOption(i, oi, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
                              onClick={() => removeOption(i, oi)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addOption(i)}>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={addField}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={save.isPending || isLoading || isError}>
            {save.isPending ? 'Saving…' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
