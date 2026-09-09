import { z } from 'zod';
import { apiFetch } from './apiFetch';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL as BASE } from './apiConfig';
import type { FieldTemplate, FieldType } from '@/types/fieldTemplate';

const ENDPOINT = `${BASE}/board/field-template`;

const KNOWN_TYPES: FieldType[] = [
  'boolean',
  'select',
  'number',
  'text',
  'textarea',
  'url',
  'date',
];

const entrySchema = z
  .object({
    key: z.string().min(1),
    label: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    order: z.number().optional().nullable(),
    required: z.boolean().optional().nullable(),
    locked: z.boolean().optional().nullable(),
    options: z.array(z.string()).optional().nullable(),
  })
  .transform((e, ctx) => {
    const raw = (e.type ?? 'text').toLowerCase();
    const normalized =
      raw === 'integer' || raw === 'int' || raw === 'long' || raw === 'double'
        ? 'number'
        : raw === 'string'
          ? 'text'
          : raw === 'bool'
            ? 'boolean'
            : raw === 'dropdown' || raw === 'enum'
              ? 'select'
              : raw;
    const type = (KNOWN_TYPES as string[]).includes(normalized)
      ? (normalized as FieldType)
      : ('text' as FieldType);
    void ctx;
    return {
      key: e.key,
      label: e.label?.trim() || e.key,
      type,
      order: e.order ?? 0,
      required: e.required ?? false,
      locked: e.locked ?? false,
      options: e.options ?? null,
    };
  });

const templateSchema = z.object({
  builtIn: z.array(entrySchema).optional().default([]),
  custom: z.array(entrySchema).optional().default([]),
});

const EMPTY: FieldTemplate = { builtIn: [], custom: [] };

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No authentication token available');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
};

const sortByOrder = (t: FieldTemplate): FieldTemplate => ({
  builtIn: [...t.builtIn].sort((a, b) => a.order - b.order),
  custom: [...t.custom].sort((a, b) => a.order - b.order),
});

export const fieldTemplateApi = {
  getTemplate: async (): Promise<FieldTemplate> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(ENDPOINT, { headers });
    if (res.status === 404) return EMPTY;
    if (!res.ok) throw new Error('Failed to load field template');
    const json = await res.json();
    const parsed = templateSchema.safeParse(json ?? {});
    if (!parsed.success) {
      console.warn('Field template failed validation', parsed.error.flatten());
      return EMPTY;
    }
    return sortByOrder(parsed.data);
  },

  updateTemplate: async (template: FieldTemplate): Promise<FieldTemplate> => {
    const headers = await getAuthHeaders();
    const body = {
      builtIn: template.builtIn,
      custom: template.custom.map((f, i) => ({ ...f, order: i })),
    };
    const res = await apiFetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to save field template');
    try {
      const json = await res.json();
      const parsed = templateSchema.safeParse(json ?? {});
      if (parsed.success) return sortByOrder(parsed.data);
    } catch {
      /* empty body is fine */
    }
    return sortByOrder(body as FieldTemplate);
  },
};
