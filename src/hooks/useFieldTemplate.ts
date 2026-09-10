import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fieldTemplateApi } from '@/lib/fieldTemplateApi';
import { normalizeStatus } from '@/lib/statusMapper';
import type { FieldTemplate } from '@/types/fieldTemplate';

const KEY = ['fieldTemplate'] as const;

export const useFieldTemplate = () =>
  useQuery({
    queryKey: KEY,
    queryFn: fieldTemplateApi.getTemplate,
    staleTime: 5 * 60_000,
    retry: false,
  });

/**
 * Canonical status options defined by the backend field template
 * (builtIn entry with key "status"). Empty when unavailable.
 */
export const useStatusOptions = (): string[] => {
  const { data } = useFieldTemplate();
  const raw = (data?.builtIn ?? []).find((f) => f.key === 'status')?.options ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of raw) {
    if (typeof o !== 'string' || !o.trim()) continue;
    const canonical = normalizeStatus(o);
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
  }
  return out;
};


export const useUpdateFieldTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tpl: FieldTemplate) => fieldTemplateApi.updateTemplate(tpl),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};
