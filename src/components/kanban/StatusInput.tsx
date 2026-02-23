import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';
import { canonicalToLabel } from '@/lib/statusMapper';

interface StatusInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StatusInput = ({ value, onChange }: StatusInputProps) => {
  // Single source of truth: canonical statuses from the backend API
  const { data: canonicalStatuses = [] } = useQuery({
    queryKey: ['unique-statuses'],
    queryFn: jobApi.getUniqueStatuses,
    staleTime: 60 * 1000,
  });

  return (
    <div className="flex flex-wrap gap-2">
      {canonicalStatuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === status
              ? 'bg-electric-blue text-white'
              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
          }`}
        >
          {canonicalToLabel(status)}
        </button>
      ))}
    </div>
  );
};
