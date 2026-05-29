import { useEffect, useState } from "react";
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
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number | string;
  groupName?: string;
}

export const InviteMemberModal = ({ open, onOpenChange, groupId, groupName }: Props) => {
  const [email, setEmail] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [createdForEmail, setCreatedForEmail] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setCreatedToken(null);
      setCreatedForEmail("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (e: string) => groupsApi.inviteMember(groupId, e),
    onSuccess: (token, variables) => {
      setCreatedToken(token);
      setCreatedForEmail(variables);
      toast.success("Invite created");
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 409) {
          const msg = (err.message || "").toLowerCase();
          if (msg.includes("member") || msg.includes("already"))
            return toast.error("That person is already a member of this group.");
          return toast.error(err.message || "That person is already invited.");
        }
        // Surface backend response body for all other errors
        const serverMsg = err.message?.trim();
        const fallback =
          err.status === 400
            ? "Invalid email."
            : err.status === 403
              ? "Only the owner can invite members."
              : err.status === 404
                ? "Group not found."
                : err.status >= 500
                  ? "Couldn't create invite. Please try again."
                  : "Couldn't create invite.";
        return toast.error(serverMsg || fallback, {
          description: serverMsg ? `Status ${err.status}` : undefined,
        });
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

  const inviteUrl = createdToken
    ? `${window.location.origin}/invite/${createdToken}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy manually.");
    }
  };

  const mailtoHref = createdToken
    ? `mailto:${encodeURIComponent(createdForEmail)}?subject=${encodeURIComponent(
        `Join ${groupName ?? "my group"} on ApplyZap`,
      )}&body=${encodeURIComponent(
        `You've been invited to join ${groupName ?? "a group"} on ApplyZap.\n\nSign in as ${createdForEmail} and open this link:\n${inviteUrl}`,
      )}`
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!mutation.isPending) onOpenChange(o);
      }}
    >
      <DialogContent>
        {!createdToken ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
              <DialogDescription>
                We'll generate a link you can share with them.
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
                  {mutation.isPending ? "Creating..." : "Create invite"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite created</DialogTitle>
              <DialogDescription>
                Share this link with them. They must sign in as{" "}
                <span className="font-medium text-foreground">{createdForEmail}</span>{" "}
                to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="invite-url">Invite link</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-url"
                    readOnly
                    value={inviteUrl}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCopy}
                    className="gap-2 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full gap-2">
                <a href={mailtoHref}>
                  <Mail className="h-4 w-4" />
                  Open in email client
                </a>
              </Button>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreatedToken(null);
                  setCreatedForEmail("");
                  setEmail("");
                }}
              >
                Invite another
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
