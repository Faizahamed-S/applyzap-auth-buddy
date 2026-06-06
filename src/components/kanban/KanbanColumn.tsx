import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { JobApplication } from '@/types/job';
import { JobCard } from './JobCard';
import { canonicalToLabel } from '@/lib/statusMapper';

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  gray: 'bg-gray-500',
};

export const getColorClass = (color?: string): string => {
  if (!color) return 'bg-gray-500';
  return COLOR_MAP[color.toLowerCase()] || 'bg-gray-500';
};

interface ColumnHeaderProps {
  status: string;
  count: number;
  color?: string;
}

export const ColumnHeader = ({ status, count, color }: ColumnHeaderProps) => {
  const navigate = useNavigate();
  const badgeBg = getColorClass(color);
  const displayLabel = canonicalToLabel(status);
  return (
    <div
      className="w-[220px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => navigate(`/status/${status}`)}
    >
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${badgeBg}`}>
          {displayLabel}
        </span>
        <span className="text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  status: string;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const KanbanColumn = ({ status, jobs, onEdit, onDelete, onViewDetails }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'status', status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[220px] shrink-0 self-start rounded-lg border transition-colors duration-200 ${
        isOver ? 'border-primary bg-primary/10' : 'border-transparent'
      }`}
    >
      <div className="p-2 space-y-2">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <p className="text-xs font-medium">No applications</p>
                  <p className="text-[10px] mt-0.5">Drag applications here</p>
                </div>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} onViewDetails={onViewDetails} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
