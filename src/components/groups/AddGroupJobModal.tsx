import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GroupsApiError } from "@/lib/groupsApi";
import { groupJobsApi } from "@/lib/groupJobsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number | string;
}

export const AddGroupJobModal = ({ open, onOpenChange, groupId }: Props) => {
  const [jobLink, setJobLink] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const queryClient = useQueryClient();

  const reset = () => {
    setJobLink("");
    setCompanyName("");
    setRoleName("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      groupJobsApi.createJob(groupId, {
        jobLink: jobLink.trim(),
        companyName: companyName.trim(),
        roleName: roleName.trim(),
      }),
    onSuccess: () => {
      toast.success("Job added to board");
      queryClient.invalidateQueries({ queryKey: ["groupBoard", String(groupId)] });
      reset();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 400) return toast.error("That job link doesn't look valid.");
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403) return toast.error("You aren't a member of this group.");
        if (err.status === 404) return toast.error("Group not found");
        if (err.status === 409) return toast.error("That job is already on the board.");
        if (err.status >= 500) return toast.error("Couldn't add job. Please try again.");
        return toast.error(err.message || "Couldn't add job.");
      }
      toast.error("Network error. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const link = jobLink.trim();
    if (!link) return toast.error("Job link is required.");
    try {
      // basic URL sanity
      new URL(link);
    } catch {
      return toast.error("Please enter a valid URL.");
    }
    mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!mutation.isPending) onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a job to the board</DialogTitle>
          <DialogDescription>
            Share a posting with the group. Everyone tracks their own status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-link">Job link</Label>
            <Input
              id="job-link"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://company.com/jobs/123"
              autoFocus
              disabled={mutation.isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-name">Role</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Software Engineer"
                disabled={mutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
