import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { jobApi } from '@/lib/jobApi';
import { useTrackerColumns } from '@/hooks/useUserProfile';

interface StatusInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StatusInput = ({ value, onChange, placeholder }: StatusInputProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: usedStatuses = [] } = useQuery({
    queryKey: ['unique-statuses'],
    queryFn: jobApi.getUniqueStatuses,
    staleTime: 60 * 1000,
  });

  const { columns } = useTrackerColumns();
  const columnTitles = columns.map(c => c.title);

  // Merge column titles + used statuses, deduplicate
  const allSuggestions = Array.from(new Set([...columnTitles, ...usedStatuses]));

  const filtered = allSuggestions.filter(s =>
    s.toLowerCase().includes((filter || value).toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setFilter(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'e.g. Applied, Interview, Ghosted 👻'}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
          {filtered.map((status) => (
            <button
              key={status}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(status);
                setFilter('');
                setOpen(false);
              }}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
