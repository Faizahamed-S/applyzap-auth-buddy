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
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LIMIT_MESSAGE = "You can own a maximum of 2 groups. Delete one to create another.";
const LIMIT_MESSAGE = "You can own at most 2 groups.";

const looksLikeLimitError = (err: GroupsApiError) => {
  const msg = (err.message || "").toLowerCase();
  return (
    err.status === 403 ||
    err.status === 409 ||
    msg.includes("maximum number of groups") ||
    msg.includes("limit") ||
    msg.includes("maximum") ||
    msg.includes("max ") ||
    msg.includes("only 2") ||
    msg.includes("two groups")
  );
};


export const CreateGroupModal = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (groupName: string) => groupsApi.createGroup(groupName),
    onSuccess: () => {
      toast.success("Group created");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setName("");
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (looksLikeLimitError(err)) {
          toast.error(LIMIT_MESSAGE);
          return;
        }
        if (err.status >= 500) {
          toast.error("Something went wrong creating the group. Please try again.");
          return;
        }
        toast.error(err.message || "Couldn't create group.");
        return;
      }
      toast.error("Network error. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a group name.");
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!mutation.isPending) onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new group</DialogTitle>
          <DialogDescription>
            Groups let you collaborate with others on job applications.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team Alpha"
              maxLength={60}
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
              {mutation.isPending ? "Creating..." : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
