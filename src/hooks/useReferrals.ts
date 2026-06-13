import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referralApi } from '@/lib/referralApi';
import { CreateReferral, ReferralFieldTemplate, UpdateReferral } from '@/types/referral';

const KEY_LIST = ['referrals'] as const;
const KEY_TEMPLATE = ['referrals', 'template'] as const;

export const useReferrals = () =>
  useQuery({ queryKey: KEY_LIST, queryFn: referralApi.list, staleTime: 60_000 });

export const useReferralTemplate = () =>
  useQuery({ queryKey: KEY_TEMPLATE, queryFn: referralApi.getTemplate, staleTime: 5 * 60_000 });

export const useCreateReferral = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReferral) => referralApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_LIST }),
  });
};

export const useUpdateReferral = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateReferral }) =>
      referralApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_LIST }),
  });
};

export const useDeleteReferral = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => referralApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_LIST }),
  });
};

export const useUpdateReferralTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tpl: ReferralFieldTemplate) => referralApi.updateTemplate(tpl),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_TEMPLATE }),
  });
};
