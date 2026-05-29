import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number | string;
}

const isDev = import.meta.env.DEV;

export const InviteMemberModal = ({ open, onOpenChange, groupId }: Props) => {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: (e: string) => groupsApi.inviteMember(groupId, e),
    onSuccess: async (token) => {
      toast.success("Invite sent");
      if (isDev && token) {
        try {
          await navigator.clipboard.writeText(token);
          toast.message("Invite token copied to clipboard (dev only)");
        } catch {
          // ignore clipboard failures
        }
      }
      setEmail("");
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403) return toast.error("Only the owner can invite members.");
        if (err.status === 404) return toast.error("Group not found");
        if (err.status === 409)
          return toast.error("That person is already invited or in the group.");
        if (err.status >= 500) return toast.error("Couldn't send invite. Please try again.");
        return toast.error(err.message || "Couldn't send invite.");
      }
      toast.error("Network error. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Please enter a valid email.");
      return;
    }
    mutation.mutate(trimmed);
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
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            We'll send them an invite link to join this group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              autoFocus
              disabled={mutation.isPending}
            />
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
              {mutation.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
