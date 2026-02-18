import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/userApi';
import { TrackerConfig } from '@/types/user';

const DEFAULT_COLUMNS: TrackerConfig['columns'] = [
  { id: 'col_wishlist', title: 'Wishlist', color: 'gray' },
  { id: 'col_applied', title: 'Applied', color: 'blue' },
  { id: 'col_interviewing', title: 'Interviewing', color: 'amber' },
  { id: 'col_offer', title: 'Offer', color: 'emerald' },
  { id: 'col_rejected', title: 'Rejected', color: 'red' },
];

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useTrackerColumns = () => {
  const { data: user, isLoading } = useUserProfile();

  const columns =
    user?.trackerConfig?.columns && user.trackerConfig.columns.length > 0
      ? user.trackerConfig.columns
      : DEFAULT_COLUMNS;

  return { columns, isLoading };
};

export { DEFAULT_COLUMNS };
