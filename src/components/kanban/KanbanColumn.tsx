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

const getColorClass = (color?: string): string => {
  if (!color) return 'bg-gray-500';
  return COLOR_MAP[color.toLowerCase()] || 'bg-gray-500';
};

interface KanbanColumnProps {
  status: string;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  color?: string;
}

export const KanbanColumn = ({ status, jobs, onEdit, onDelete, onViewDetails, color }: KanbanColumnProps) => {
  const navigate = useNavigate();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'status', status },
  });
  const badgeBg = getColorClass(color);
  const displayLabel = canonicalToLabel(status);

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-badge]')) {
      navigate(`/status/${status}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[220px] shrink-0 self-start rounded-xl border transition-colors duration-200 ${
        isOver ? 'border-primary bg-primary/10' : 'border-border'
      }`}
    >
      {/* Sticky Column Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm rounded-t-xl transition-all duration-200">
        <div
          className="cursor-pointer hover:opacity-90 transition-opacity px-3 py-2.5"
          onClick={handleHeaderClick}
        >
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${badgeBg}`}>
              {displayLabel}
            </span>
            <span className="text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full text-xs" data-badge>
              {jobs.length}
            </span>
          </div>
        </div>
        <div className="border-b border-border mx-3" />
      </div>

      {/* Cards area — natural height */}
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
