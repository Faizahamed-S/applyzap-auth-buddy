import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';
import { useTrackerColumns } from '@/hooks/useUserProfile';
import { useStatusOptions } from '@/hooks/useFieldTemplate';
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
  const templateOptions = useStatusOptions();

  // Preference order: backend field-template status options, then board columns,
  // then any additional statuses already used on applications. Deduped by canonical key.
  const allStatuses = (() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const add = (raw: string) => {
      if (!raw || !raw.trim()) return;
      const canonical = normalizeStatus(raw);
      if (seen.has(canonical)) return;
      seen.add(canonical);
      out.push(canonical);
    };
    templateOptions.forEach(add);
    columns.forEach((col) => add(col.title));
    usedStatuses.forEach(add);
    return out;
  })();


  return (
    <div className="flex flex-wrap gap-2">
      {allStatuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
            normalizeStatus(value) === status
              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              : 'bg-background text-foreground border-border hover:bg-muted'
          }`}
        >
          {canonicalToLabel(status)}
        </button>
      ))}
    </div>
  );
};
