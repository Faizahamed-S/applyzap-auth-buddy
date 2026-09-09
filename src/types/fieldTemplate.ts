export type FieldType =
  | 'boolean'
  | 'select'
  | 'number'
  | 'text'
  | 'textarea'
  | 'url'
  | 'date';

/** The five types a user can create for their own fields. */
export const EDITABLE_FIELD_TYPES: { value: FieldType; label: string; hint: string }[] = [
  { value: 'boolean', label: 'Yes / No', hint: 'A simple on/off switch' },
  { value: 'select', label: 'Dropdown', hint: 'Pick one of your options' },
  { value: 'number', label: 'Number', hint: 'Whole numbers only' },
  { value: 'text', label: 'Short text', hint: 'Up to 255 characters' },
  { value: 'textarea', label: 'Long text', hint: 'Up to about 3 pages' },
];

export const SHORT_TEXT_MAX = 255;
export const LONG_TEXT_MAX = 9000;

export interface FieldTemplateEntry {
  key: string;
  label: string;
  type: FieldType;
  order: number;
  required: boolean;
  locked: boolean;
  options: string[] | null;
}

export interface FieldTemplate {
  builtIn: FieldTemplateEntry[];
  custom: FieldTemplateEntry[];
}

export const fieldTypeLabel = (type: FieldType): string => {
  switch (type) {
    case 'boolean':
      return 'Yes / No';
    case 'select':
      return 'Dropdown';
    case 'number':
      return 'Number';
    case 'textarea':
      return 'Long text';
    case 'url':
      return 'Link';
    case 'date':
      return 'Date';
    default:
      return 'Short text';
  }
};

export const labelToKey = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
