import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LONG_TEXT_MAX,
  SHORT_TEXT_MAX,
  type FieldTemplateEntry,
} from '@/types/fieldTemplate';

export type TemplateValues = Record<string, unknown>;

interface Props {
  fields: FieldTemplateEntry[];
  values: TemplateValues;
  errors?: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
}

/** Pull initial values for template fields out of an application's metadata. */
export const valuesFromMetadata = (
  fields: FieldTemplateEntry[],
  metadata?: Record<string, unknown> | null,
): TemplateValues => {
  const out: TemplateValues = {};
  for (const f of fields) {
    const raw = metadata?.[f.key];
    if (f.type === 'boolean') out[f.key] = raw === true || raw === 'true';
    else out[f.key] = raw == null ? '' : String(raw);
  }
  return out;
};

/** Which metadata keys are owned by the template (so the fallback editor can skip them). */
export const templateKeys = (fields: FieldTemplateEntry[]): Set<string> =>
  new Set(fields.map((f) => f.key));

export const validateTemplateValues = (
  fields: FieldTemplateEntry[],
  values: TemplateValues,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (f.type === 'boolean') continue;
    const s = typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
    if (!s) {
      if (f.required) errors[f.key] = `${f.label} is required`;
      continue;
    }
    if (f.type === 'number' && !/^-?\d+$/.test(s)) {
      errors[f.key] = 'Enter a whole number';
    }
    if (f.type === 'text' && s.length > SHORT_TEXT_MAX) {
      errors[f.key] = `Keep it under ${SHORT_TEXT_MAX} characters`;
    }
    if (f.type === 'textarea' && s.length > LONG_TEXT_MAX) {
      errors[f.key] = `Keep it under ${LONG_TEXT_MAX} characters`;
    }
    if (f.type === 'select' && f.options?.length && !f.options.includes(s)) {
      errors[f.key] = 'Pick one of the available options';
    }
  }
  return errors;
};

/** Turn template values into metadata entries (skipping blanks). */
export const valuesToMetadata = (
  fields: FieldTemplateEntry[],
  values: TemplateValues,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (f.type === 'boolean') {
      out[f.key] = v === true;
      continue;
    }
    const s = typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
    if (!s) continue;
    if (f.type === 'number') {
      const n = Number(s);
      out[f.key] = Number.isFinite(n) ? n : s;
    } else {
      out[f.key] = f.type === 'textarea' ? s.slice(0, LONG_TEXT_MAX) : s.slice(0, SHORT_TEXT_MAX);
    }
  }
  return out;
};

export const TemplateFields = ({ fields, values, errors = {}, onChange }: Props) => {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const err = errors[f.key];
        const value = values[f.key];

        if (f.type === 'boolean') {
          return (
            <div
              key={f.key}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <Label className="text-sm font-medium">{f.label}</Label>
              <Switch
                checked={value === true}
                onCheckedChange={(v) => onChange(f.key, v)}
              />
            </div>
          );
        }

        return (
          <div key={f.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {f.label}
              {!f.required && <span className="text-muted-foreground"> (Optional)</span>}
            </Label>

            {f.type === 'select' ? (
              <Select
                value={typeof value === 'string' && value ? value : undefined}
                onValueChange={(v) => onChange(f.key, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {(f.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === 'textarea' ? (
              <Textarea
                value={String(value ?? '')}
                maxLength={LONG_TEXT_MAX}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="min-h-[100px] resize-none"
                placeholder={f.label}
              />
            ) : f.type === 'number' ? (
              <Input
                type="number"
                step={1}
                value={String(value ?? '')}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.label}
              />
            ) : (
              <Input
                value={String(value ?? '')}
                maxLength={SHORT_TEXT_MAX}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.label}
              />
            )}

            {err && <p className="text-sm font-medium text-destructive">{err}</p>}
          </div>
        );
      })}
    </div>
  );
};
