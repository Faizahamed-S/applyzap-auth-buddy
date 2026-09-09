import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fieldTemplateApi } from '@/lib/fieldTemplateApi';
import type { FieldTemplate } from '@/types/fieldTemplate';

const KEY = ['fieldTemplate'] as const;

export const useFieldTemplate = () =>
  useQuery({
    queryKey: KEY,
    queryFn: fieldTemplateApi.getTemplate,
    staleTime: 5 * 60_000,
    retry: false,
  });

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
