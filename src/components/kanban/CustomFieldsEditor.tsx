import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export interface CustomFieldEntry {
  key: string;
  value: string;
}

interface CustomFieldsEditorProps {
  fields: CustomFieldEntry[];
  onChange: (fields: CustomFieldEntry[]) => void;
}

export const CustomFieldsEditor = ({ fields, onChange }: CustomFieldsEditorProps) => {
  const addField = () => {
    onChange([...fields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, part: 'key' | 'value', val: string) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [part]: val } : f));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Custom Fields</label>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No custom fields yet. Click "Add Field" to add one.</p>
      )}

      {fields.map((field, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Field name (e.g. Location)"
            value={field.key}
            onChange={(e) => updateField(index, 'key', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value (e.g. San Jose)"
            value={field.value}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => removeField(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

// Convert Record to array for editing
export const metadataToFields = (metadata?: Record<string, unknown>): CustomFieldEntry[] => {
  if (!metadata) return [];
  return Object.entries(metadata).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
  }));
};

// Convert array back to Record for submission
export const fieldsToMetadata = (fields: CustomFieldEntry[]): Record<string, unknown> | undefined => {
  const valid = fields.filter((f) => f.key.trim());
  if (valid.length === 0) return undefined;
  const result: Record<string, unknown> = {};
  for (const f of valid) {
    // Try to parse numbers
    const num = Number(f.value);
    result[f.key.trim()] = !isNaN(num) && f.value.trim() !== '' ? num : f.value;
  }
  return result;
};
