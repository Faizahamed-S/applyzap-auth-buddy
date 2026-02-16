import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { JobApplication } from '@/types/job';
import { JobCard } from './JobCard';
import { getStatusConfig } from '@/lib/statusConfig';

interface KanbanColumnProps {
  status: string;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const KanbanColumn = ({ status, jobs, onEdit, onDelete, onViewDetails }: KanbanColumnProps) => {
  const navigate = useNavigate();
  const { setNodeRef, isOver } = useDroppable({ 
    id: status,
    data: {
      type: 'status',
      status: status
    }
  });
  const config = getStatusConfig(status);

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
          ? 'border-electric-blue bg-electric-blue/10' 
          : 'border-white/20'
      }`}
    >
      {/* Column Header */}
      <div 
        className="cursor-pointer hover:opacity-90 transition-opacity p-4"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${config.badgeBg}`}>
            {config.label}
          </span>
          <span className="text-white font-medium bg-white/20 px-2.5 py-1 rounded-full text-sm" data-badge>
            {jobs.length}
          </span>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-b border-white/10 mx-3" />

      {/* Cards area */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-stealth">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-white/50 border-2 border-dashed border-white/20 rounded-lg">
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
