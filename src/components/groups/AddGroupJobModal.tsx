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

const URL_HINT = "Paste the full job URL (e.g. https://company.com/careers/123)";

export const AddGroupJobModal = ({ open, onOpenChange, groupId }: Props) => {
  const [jobLink, setJobLink] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setJobLink("");
    setCompanyName("");
    setRoleName("");
    setLinkError(null);
  };

  const mapErrorMessage = (err: GroupsApiError): string => {
    const msg = err.message ?? "";
    if (
      msg.includes("Invalid job link") ||
      msg.includes("Invalid job URL") ||
      msg.includes("Job link is required")
    ) {
      return "Invalid link — use a full URL starting with https://";
    }
    if (msg.includes("Not a member")) return "You don't have access to this group";
    if (msg.includes("Group not found")) return "Group not found";
    if (err.status === 401) return "Please sign in again";
    if (err.status === 409) return "That job is already on the board.";
    return msg || "Couldn't add job. Try again.";
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
        toast.error(mapErrorMessage(err));
        return;
      }
      toast.error("Network error. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const link = jobLink.trim();
    if (!link) {
      setLinkError("Job link is required.");
      toast.error("Job link is required.");
      return;
    }
    if (!/^https?:\/\//i.test(link)) {
      setLinkError("Invalid link — use a full URL starting with https://");
      toast.error("Invalid link — use a full URL starting with https://");
      return;
    }
    try {
      new URL(link);
    } catch {
      setLinkError("Please enter a valid URL.");
      toast.error("Please enter a valid URL.");
      return;
    }
    setLinkError(null);
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
              onChange={(e) => {
                setJobLink(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="https://company.com/jobs/123"
              autoFocus
              disabled={mutation.isPending}
              aria-invalid={!!linkError}
            />
            <p
              className={
                linkError
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {linkError ?? URL_HINT}
            </p>
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
