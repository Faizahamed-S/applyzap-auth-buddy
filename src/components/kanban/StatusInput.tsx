import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';
import { useTrackerColumns } from '@/hooks/useUserProfile';

interface StatusInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const normalizeStatus = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const StatusInput = ({ value, onChange }: StatusInputProps) => {
  const { data: usedStatuses = [] } = useQuery({
    queryKey: ['unique-statuses'],
    queryFn: jobApi.getUniqueStatuses,
    staleTime: 60 * 1000,
  });

  const { columns } = useTrackerColumns();
  const columnTitles = columns.map(c => c.title);

  const allSuggestions = (() => {
    const seen = new Map<string, string>();
    for (const t of columnTitles) seen.set(t.toLowerCase(), t);
    for (const s of usedStatuses) {
      const key = s.toLowerCase();
      if (!seen.has(key)) seen.set(key, normalizeStatus(s));
    }
    return Array.from(seen.values());
  })();

  return (
    <div className="flex flex-wrap gap-2">
      {allSuggestions.map((status) => (
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
          {status}
        </button>
      ))}
    </div>
  );
};
