import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, ExternalLink, Edit2, Trash2, CheckCircle2, User, Building, Briefcase, Tag } from 'lucide-react';
import { JobApplication } from '@/types/job';
import { jobApi } from '@/lib/jobApi';
import { getStatusConfig } from '@/lib/statusConfig';

interface ApplicationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

// Use the shared status config helper

export const ApplicationDetailModal = ({ 
  open, 
  onOpenChange, 
  applicationId, 
  onEdit, 
  onDelete 
}: ApplicationDetailModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => jobApi.getApplication(applicationId!),
    enabled: !!applicationId && open,
  });

  const handleEdit = () => {
    if (application) {
      onEdit(application);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(application.id);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = application 
    ? new Date(application.dateOfApplication).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Application Details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !application) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Application</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>Failed to load application details.</p>
            <p className="text-sm mt-2">Please try again later.</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(application.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            Application Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{application.companyName}</h2>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg text-muted-foreground">{application.roleName}</span>
                </div>
              </div>
              <Badge className={`${statusConfig.badgeColor} text-sm font-medium px-3 py-1`}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Applied on {formattedDate}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Application Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-foreground">{application.companyName}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-foreground">{application.roleName}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={statusConfig.badgeColor}>{statusConfig.label}</Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                <p className="text-foreground">{formattedDate}</p>
              </div>
            </div>

            {application.jobLink && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Posting</label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  asChild
                >
                  <a
                    href={application.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Original Job Posting
                  </a>
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2">
                {application.tailored && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Tailored Application
                  </Badge>
                )}
                {application.referral && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Referral
                  </Badge>
                )}
              </div>
            </div>

            {application.jobDescription && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Job Description</label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{application.jobDescription}</p>
                </div>
              </div>
            )}

            {application.applicationMetadata && Object.keys(application.applicationMetadata).length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Custom Fields
                </label>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  {Object.entries(application.applicationMetadata).map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">{key}:</span>
                      <span className="text-sm text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            
            {application.jobLink && (
              <Button 
                variant="outline" 
                asChild
                className="w-full sm:w-auto"
              >
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Job Posting
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="w-full sm:w-auto"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Application
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Deleting...' : 'Delete Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
