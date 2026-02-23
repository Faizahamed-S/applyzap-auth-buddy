import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { User } from '@supabase/supabase-js';

import { JobApplication } from '@/types/job';
import { jobApi } from '@/lib/jobApi';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';
import { AddJobModal } from './AddJobModal';
import { EditJobModal } from './EditJobModal';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { PaginationControls } from './PaginationControls';
import { ViewToggle } from './ViewToggle';
import { AllApplicationsTable } from './AllApplicationsTable';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTrackerColumns } from '@/hooks/useUserProfile';
import { BoardSettingsModal } from './BoardSettingsModal';

interface JobKanbanBoardProps {
  user: User | null;
}

export const JobKanbanBoard = ({ user }: JobKanbanBoardProps) => {
  const queryClient = useQueryClient();
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [currentView, setCurrentView] = useState<'kanban' | 'table'>('kanban');
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);

  const { columns: trackerColumns, isLoading: isColumnsLoading } = useTrackerColumns();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['job-applications', currentPage, itemsPerPage],
    queryFn: () => jobApi.getAllApplications(undefined, currentPage, itemsPerPage),
  });

  const createMutation = useMutation({
    mutationFn: jobApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['unique-statuses'] });
      toast.success('Application added successfully!');
    },
    onError: () => {
      toast.error('Failed to add application');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['unique-statuses'] });
      toast.success('Application updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update application');
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.patchApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['unique-statuses'] });
      toast.success('Status updated!');
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      const msg = error?.message?.includes('401') || error?.message?.includes('403')
        ? 'Not authorized to update status'
        : 'Could not update status; please try again';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: jobApi.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application deleted');
    },
    onError: () => {
      toast.error('Failed to delete application');
    },
  });


  const handleDragStart = (event: DragStartEvent) => {
    const job = applications.find((j) => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    let newStatus: string;
    
    if (over.data?.current?.type === 'status') {
      newStatus = over.data.current.status;
    } else {
      const targetJob = applications.find((j) => j.id === over.id);
      if (targetJob) {
        newStatus = targetJob.status;
      } else {
        if (columnTitles.includes(over.id as string)) {
          newStatus = over.id as string;
        } else {
          return;
        }
      }
    }

    const job = applications.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    queryClient.setQueryData(['job-applications', currentPage, itemsPerPage], (old: JobApplication[]) =>
      old.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    patchMutation.mutate({ id: jobId, data: { status: newStatus } });
  };

  const handleAddJob = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEditJob = (id: string, data: any) => {
    updateMutation.mutate({ id, data });
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    setViewingJobId(id);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['job-applications'] });
  };

  const getJobsByColumn = (columnTitle: string) =>
    applications.filter((job) => job.status.toUpperCase() === columnTitle.toUpperCase());

  const columnTitles = useMemo(() => trackerColumns.map(c => c.title), [trackerColumns]);

  const unmatchedApps = useMemo(() => {
    const titleSet = new Set(columnTitles.map(t => t.toUpperCase()));
    return applications.filter((job) => !titleSet.has(job.status.toUpperCase()));
  }, [applications, columnTitles]);

  if (isLoading || isColumnsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full bg-background">
      {/* Main Content - Constrained Width */}
      <div className="max-w-[1600px] w-[85%] mx-auto px-4 py-8">
        {/* Action Bar - Title on Left, Controls on Right */}
        <div className="flex items-center justify-between mb-8">
          {/* Left: Page Title + Tagline */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Application Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Manage your job search with drag-and-drop simplicity
            </p>
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsBoardSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="active:scale-95 transition-all duration-150"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {currentView === 'kanban' ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 pb-4 overflow-x-auto">
                {trackerColumns.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    status={col.title}
                    jobs={getJobsByColumn(col.title)}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteJob}
                    onViewDetails={handleViewDetails}
                    color={col.color}
                  />
                ))}
                {unmatchedApps.length > 0 && (
                  <KanbanColumn
                    key="__other"
                    status="Other"
                    jobs={unmatchedApps}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteJob}
                    onViewDetails={handleViewDetails}
                    color="gray"
                  />
                )}
              </div>

              <DragOverlay>
                {activeJob ? (
                  <div className="rotate-3 scale-105">
                    <JobCard
                      job={activeJob}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onViewDetails={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
          <AllApplicationsTable
            applications={applications}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteJob}
            onStatusChange={handleStatusChange}
          />
        )}

        {applications.length > 0 && (
          <div className="mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(applications.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={applications.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      <AddJobModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddJob}
      />

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={editingJob}
        onSubmit={handleEditJob}
      />

      <ApplicationDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        applicationId={viewingJobId}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteJob}
      />

      <BoardSettingsModal
        open={isBoardSettingsOpen}
        onOpenChange={setIsBoardSettingsOpen}
        columns={trackerColumns}
      />
    </div>
  );
};
