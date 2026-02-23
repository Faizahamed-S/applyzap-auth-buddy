import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';
import { useTrackerColumns } from '@/hooks/useUserProfile';
import { normalizeStatus, canonicalToLabel } from '@/lib/statusMapper';

interface StatusInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StatusInput = ({ value, onChange }: StatusInputProps) => {
  const { data: usedStatuses = [] } = useQuery({
    queryKey: ['unique-statuses'],
    queryFn: jobApi.getUniqueStatuses,
    staleTime: 60 * 1000,
  });

  const { columns } = useTrackerColumns();

  // Merge board column statuses + backend statuses, deduplicated by canonical key
  const allStatuses = (() => {
    const seen = new Map<string, string>();
    // Board columns first (preserves user's configured order)
    for (const col of columns) {
      const canonical = normalizeStatus(col.title);
      if (!seen.has(canonical)) seen.set(canonical, canonical);
    }
    // Then any additional statuses from backend
    for (const s of usedStatuses) {
      const canonical = normalizeStatus(s);
      if (!seen.has(canonical)) seen.set(canonical, canonical);
    }
    return Array.from(seen.values());
  })();

  return (
    <div className="flex flex-wrap gap-2">
      {allStatuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            normalizeStatus(value) === status
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
