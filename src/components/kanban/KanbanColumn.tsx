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
      className={`flex flex-col h-full rounded-lg border border-border bg-transparent transition-all duration-200 ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {/* Header with colored accent bar */}
      <div 
        className="cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleHeaderClick}
      >
        <div className={`h-1 rounded-t-lg ${config.headerAccentColor}`} />
        <div className="p-4 bg-card rounded-b-none border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <Badge className={`${config.badgeColor} font-medium`} data-badge>
              {jobs.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cards area - transparent background */}
      <div className="flex-1 p-3 space-y-3 min-h-[500px] max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-card/50">
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
