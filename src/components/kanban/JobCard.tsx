import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobApplication } from '@/types/job';
import { Calendar } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const JobCard = ({ job, onEdit, onDelete, onViewDetails }: JobCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: { type: 'job', job, status: job.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const formattedDate = new Date(job.dateOfApplication).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onViewDetails(job.id)}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-gray-200 bg-white hover:border-electric-blue/50 transition-all duration-150 px-3 py-2.5 shadow-sm"
    >
      <p className="text-sm font-semibold text-gray-900 truncate">{job.companyName}</p>
      <p className="text-xs text-gray-500 truncate mt-1.5">{job.roleName}</p>
      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-400">
        <Calendar className="h-3 w-3 flex-shrink-0" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};
