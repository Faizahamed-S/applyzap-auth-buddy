import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { StatusInput } from './StatusInput';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JobApplication } from '@/types/job';
import { CustomFieldsEditor, metadataToFields, fieldsToMetadata, CustomFieldEntry } from './CustomFieldsEditor';
import { ReferralCombobox } from '@/components/referrals/ReferralCombobox';
import {
  ensureGroupsCache,
  refreshGroupsCache,
  getLastSelectedGroupIds,
  type GroupSummary,
} from '@/lib/groupsCache';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  roleName: z.string().min(1, 'Role name is required'),
  dateOfApplication: z.string().min(1, 'Date is required'),
  status: z.string().min(1, 'Status is required'),
  jobLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tailored: z.boolean().default(false),
  jobDescription: z.string().optional(),
  referral: z.boolean().default(false),
  referralContactId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
  onSubmit: (id: string, data: FormValues) => void;
}

export const EditJobModal = ({ open, onOpenChange, job, onSubmit }: EditJobModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFields, setCustomFields] = useState<CustomFieldEntry[]>([]);

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [postToGroups, setPostToGroups] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      roleName: '',
      dateOfApplication: '',
      status: '',
      jobLink: '',
      tailored: false,
      jobDescription: '',
      referral: false,
      referralContactId: null,
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        companyName: job.companyName,
        roleName: job.roleName,
        dateOfApplication: job.dateOfApplication.split('T')[0],
        status: job.status,
        jobLink: job.jobLink || '',
        tailored: job.tailored,
        jobDescription: job.jobDescription || '',
        referral: job.referral || false,
        referralContactId: job.referralContactId ?? null,
      });
      setCustomFields(metadataToFields(job.applicationMetadata));
      // Reset group-share state each time a new job is loaded.
      setPostToGroups(false);
      setSelectedGroupIds([]);
      setGroupError(null);
    }
  }, [job, form]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGroupsLoading(true);
    ensureGroupsCache()
      .then((list) => {
        if (cancelled) return;
        setGroups(list);
        const remembered = getLastSelectedGroupIds();
        const valid = remembered.filter((id) => list.some((g) => g.id === id));
        setSelectedGroupIds(valid);
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleToggleGroups = async (checked: boolean) => {
    setPostToGroups(checked);
    setGroupError(null);
    if (checked) {
      const fresh = await refreshGroupsCache();
      setGroups(fresh);
      setSelectedGroupIds((prev) => prev.filter((id) => fresh.some((g) => g.id === id)));
    }
  };

  const toggleGroup = (id: number, checked: boolean) => {
    setGroupError(null);
    setSelectedGroupIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const handleSubmit = async (data: FormValues) => {
    if (!job) return;
    if (postToGroups && selectedGroupIds.length === 0) {
      setGroupError('Select at least one group, or turn the toggle off.');
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = fieldsToMetadata(customFields);
      const groupIds = postToGroups ? selectedGroupIds : undefined;
      await onSubmit(job.id, {
        ...data,
        ...(metadata ? { applicationMetadata: metadata } : {}),
        ...(groupIds !== undefined ? { __groupIds: groupIds } : {}),
      } as any);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
          <DialogDescription>
            Update your job application details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfApplication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Application</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <StatusInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referral"
              render={({ field }) => (
                <FormItem className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Referral</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Do you have a referral for this position?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(v) => {
                          field.onChange(v);
                          if (!v) form.setValue('referralContactId', null);
                        }}
                      />
                    </FormControl>
                  </div>
                  {field.value && (
                    <FormField
                      control={form.control}
                      name="referralContactId"
                      render={({ field: refField }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Link a referral (optional)
                          </FormLabel>
                          <FormControl>
                            <ReferralCombobox
                              value={refField.value ?? null}
                              onChange={refField.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tailored"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Tailored Application</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Did you customize your resume/cover letter?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <CustomFieldsEditor fields={customFields} onChange={setCustomFields} />

            <Separator />

            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Also add to collaborative group(s)
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {groupsLoading
                      ? 'Loading your groups…'
                      : groups.length === 0
                        ? 'Join or create a group first.'
                        : 'Share this job with your group boards. Requires a job link.'}
                  </div>
                </div>
                <Switch
                  checked={postToGroups}
                  onCheckedChange={handleToggleGroups}
                  disabled={groupsLoading || groups.length === 0}
                />
              </div>

              {groups.length === 0 && !groupsLoading && (
                <Button asChild variant="ghost" size="sm" className="h-auto p-0 text-primary">
                  <Link to="/groups">Go to groups →</Link>
                </Button>
              )}

              {postToGroups && groups.length > 0 && (
                <div className="space-y-2">
                  <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-border p-2">
                    {groups.map((g) => {
                      const checked = selectedGroupIds.includes(g.id);
                      return (
                        <label
                          key={g.id}
                          className="flex items-center gap-2 cursor-pointer text-sm py-1"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggleGroup(g.id, v === true)}
                          />
                          <span className="truncate">{g.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {groupError && (
                    <p className="text-sm text-destructive">{groupError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
