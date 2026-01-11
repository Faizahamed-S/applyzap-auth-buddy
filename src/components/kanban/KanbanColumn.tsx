import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { JobApplication, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/statusConfig';

interface KanbanColumnProps {
  status: JobStatus;
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
  const config = STATUS_CONFIG[status];

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-badge]')) {
      navigate(`/status/${status}`);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col h-full transition-all duration-200 ${isOver ? 'ring-2 ring-electric-blue ring-offset-2 ring-offset-deep-blue rounded-lg' : ''}`}
    >
      {/* Column Header */}
      <div 
        className="cursor-pointer hover:opacity-90 transition-opacity mb-4"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <h3 className={`font-semibold text-lg ${config.headerTextColor}`}>{config.label}</h3>
          <Badge className={`${config.badgeColor} font-medium`} data-badge>
            {jobs.length}
          </Badge>
        </div>
      </div>

      {/* Cards area - transparent background */}
      <div className="flex-1 space-y-3 min-h-[500px] max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-white/40 border-2 border-dashed border-white/20 rounded-lg">
                <div className="text-center">
                  <p className="text-sm">No applications</p>
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
