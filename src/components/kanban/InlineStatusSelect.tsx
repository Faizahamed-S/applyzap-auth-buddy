import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getStatusConfig } from '@/lib/statusConfig';
import { Check, X } from 'lucide-react';
import { StatusInput } from './StatusInput';

interface InlineStatusSelectProps {
  applicationId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export const InlineStatusSelect = ({ 
  applicationId, 
  currentStatus, 
  onStatusChange 
}: InlineStatusSelectProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentStatus);
  const queryClient = useQueryClient();

  const statusConfig = getStatusConfig(currentStatus);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      jobApi.patchApplication(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['unique-statuses'] });
      toast.success('Status updated successfully!');
      onStatusChange?.(variables.status);
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== currentStatus) {
      updateMutation.mutate({ id: applicationId, status: trimmed });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-40">
          <StatusInput
            value={editValue}
            onChange={setEditValue}
            placeholder="Status..."
          />
        </div>
        <button
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={handleSave}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={() => { setEditValue(currentStatus); setIsEditing(false); }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${statusConfig.badgeColor} text-sm font-medium px-3 py-1 rounded-full`}>
        {currentStatus}
      </Badge>
      
      <button
        onClick={() => { setEditValue(currentStatus); setIsEditing(true); }}
        className="ml-1 p-1 hover:bg-muted rounded transition-colors"
        disabled={updateMutation.isPending}
      >
        <svg 
          className="w-4 h-4 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
};
