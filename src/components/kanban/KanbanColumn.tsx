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
  status: string; // canonical status key (e.g. "TO_APPLY")
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
    data: {
      type: 'status',
      status: status
    }
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
      className={`flex flex-col flex-1 min-w-[200px] min-h-[calc(100vh-220px)] rounded-xl border transition-colors duration-200 ${
        isOver 
          ? 'border-primary bg-primary/10' 
          : 'border-border'
      }`}
    >
      {/* Column Header */}
      <div 
        className="cursor-pointer hover:opacity-90 transition-opacity p-4"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${badgeBg}`}>
            {displayLabel}
          </span>
          <span className="text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full text-sm" data-badge>
            {jobs.length}
          </span>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-b border-border mx-3" />

      {/* Cards area */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-stealth">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium">No applications</p>
                  <p className="text-xs mt-1">Drag applications here</p>
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
