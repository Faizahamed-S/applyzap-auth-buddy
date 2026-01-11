import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobApplication, JobStatus } from '@/types/job';
import { jobApi } from '@/lib/jobApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditJobModal } from './EditJobModal';
import { InlineStatusSelect } from './InlineStatusSelect';
import { Search, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'companyName' | 'roleName' | 'status' | 'dateOfApplication';
type SortDirection = 'asc' | 'desc';

interface AllApplicationsTableProps {
  applications: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: () => void;
}

export const AllApplicationsTable = ({ 
  applications, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: AllApplicationsTableProps) => {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateOfApplication');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update application');
    },
  });

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((job) =>
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase();
          bValue = b.companyName.toLowerCase();
          break;
        case 'roleName':
          aValue = a.roleName.toLowerCase();
          bValue = b.roleName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dateOfApplication':
          aValue = new Date(a.dateOfApplication).getTime();
          bValue = new Date(b.dateOfApplication).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (id: string, data: any) => {
    updateMutation.mutate({ id, data });
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Search input with dark styling */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder="Search by company or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-electric-blue focus:ring-electric-blue"
        />
      </div>

      {/* Dark mode table */}
      <div className="rounded-xl border border-white/20 bg-[#0a1445] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead 
                className="cursor-pointer hover:bg-white/5 text-white/70 font-semibold"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-white/5 text-white/70 font-semibold"
                onClick={() => handleSort('companyName')}
              >
                Company {getSortIcon('companyName')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-white/5 text-white/70 font-semibold"
                onClick={() => handleSort('roleName')}
              >
                Position {getSortIcon('roleName')}
              </TableHead>
              <TableHead className="text-white/70 font-semibold">Link</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-white/5 text-white/70 font-semibold"
                onClick={() => handleSort('dateOfApplication')}
              >
                Application Date {getSortIcon('dateOfApplication')}
              </TableHead>
              <TableHead className="text-white/70 font-semibold">Tailored</TableHead>
              <TableHead className="text-white/70 font-semibold">Referral</TableHead>
              <TableHead className="text-right text-white/70 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12 text-white/50">
                  {searchTerm ? 'No applications found matching your search.' : 'No applications found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedApplications.map((job) => (
                <TableRow 
                  key={job.id} 
                  className="group border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <TableCell>
                    <InlineStatusSelect
                      applicationId={job.id}
                      currentStatus={job.status}
                      onStatusChange={onStatusChange}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-white">{job.companyName}</TableCell>
                  <TableCell className="text-white/90">{job.roleName}</TableCell>
                  <TableCell>
                    {job.jobLink ? (
                      <Button 
                        variant="link" 
                        size="sm" 
                        asChild 
                        className="text-electric-blue hover:text-electric-blue/80 p-0"
                      >
                        <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="h-4 w-4 text-white/50" />
                      {formatDate(job.dateOfApplication)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.tailored ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ Tailored</Badge>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.referral ? (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">👤 Referral</Badge>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        className="text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(job.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <div className="opacity-30 group-hover:opacity-0 transition-opacity duration-200">
                      <span className="text-white/50 text-sm">⋮</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={editingJob}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};
