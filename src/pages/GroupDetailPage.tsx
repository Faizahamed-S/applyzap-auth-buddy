import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, UserPlus, LayoutGrid, LogOut, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";
import { refreshGroupsCache } from "@/lib/groupsCache";
import { userApi } from "@/lib/userApi";
import { MemberList } from "@/components/groups/MemberList";
import { InviteMemberModal } from "@/components/groups/InviteMemberModal";

const GroupDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { groupId } = useParams<{ groupId: string }>();
  const [authLoading, setAuthLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setAuthLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const groupQuery = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !authLoading && !!groupId,
    retry: false,
  });

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: userApi.getProfile,
    enabled: !authLoading,
    retry: false,
  });

  useEffect(() => {
    if (!groupQuery.isError) return;
    const err = groupQuery.error;
    if (err instanceof GroupsApiError) {
      if (err.status === 401) toast.error("Please sign in again");
      else if (err.status === 403) toast.error("You don't have access to this group");
      else if (err.status === 404) toast.error("Group not found");
      else toast.error("Couldn't load this group. Please try again.");
    } else {
      toast.error("Couldn't load this group. Please try again.");
    }
  }, [groupQuery.isError, groupQuery.error]);

  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leaveGroup(groupId!),
    onSuccess: () => {
      toast.success("You've left the group");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      refreshGroupsCache();
      navigate("/groups");
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403)
          return toast.error("Owners can't leave — delete the group instead.");
        if (err.status === 404) return toast.error("Group not found");
        if (err.status >= 500) return toast.error("Couldn't leave group. Please try again.");
        return toast.error(err.message || "Couldn't leave group.");
      }
      toast.error("Network error. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupsApi.deleteGroup(groupId!),
    onSuccess: () => {
      toast.success("Group deleted");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      refreshGroupsCache();
      navigate("/groups");
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403) return toast.error("Only the owner can delete this group.");
        if (err.status === 404) return toast.error("Group not found");
        if (err.status >= 500) return toast.error("Couldn't delete group. Please try again.");
        return toast.error(err.message || "Couldn't delete group.");
      }
      toast.error("Network error. Please try again.");
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const group = groupQuery.data;

  // Determine ownership by matching profile.id (backend numeric id as string)
  // to group.ownerId. Fallback: assume non-owner.
  let isOwner = false;
  if (group && profileQuery.data?.id) {
    const myId = Number(profileQuery.data.id);
    if (!Number.isNaN(myId)) isOwner = myId === group.ownerId;
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1100px] w-[92%] mx-auto py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link to={`/groups/${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to board
          </Link>
        </Button>

        {groupQuery.isLoading ? (
          <Card className="border border-border bg-card animate-pulse">
            <CardContent className="p-10 h-40" />
          </Card>
        ) : groupQuery.isError ? (
          <Card className="border border-border bg-card">
            <CardContent className="p-10 text-center space-y-3">
              <p className="text-foreground font-medium">
                {groupQuery.error instanceof GroupsApiError &&
                groupQuery.error.status === 404
                  ? "Group not found"
                  : groupQuery.error instanceof GroupsApiError &&
                    groupQuery.error.status === 403
                  ? "You don't have access to this group"
                  : "Couldn't load this group."}
              </p>
              <Button asChild variant="secondary">
                <Link to="/groups">Back to groups</Link>
              </Button>
            </CardContent>
          </Card>
        ) : group ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h1 className="text-3xl font-bold text-foreground truncate">
                  {group.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      return `Created ${format(
                        parseISO(group.createdAt),
                        "MMM d, yyyy",
                      )}`;
                    } catch {
                      return null;
                    }
                  })()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => navigate(`/groups/${group.id}/board`)}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Open collaborative board
                </Button>
                {isOwner && (
                  <Button
                    variant="secondary"
                    onClick={() => setInviteOpen(true)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite member
                  </Button>
                )}
              </div>
            </div>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Members ({group.members?.length ?? 0})
                </h2>
              </div>
              <MemberList members={group.members ?? []} />
            </section>

            <section className="pt-4 border-t border-border flex flex-wrap gap-2">
              {isOwner ? (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete group
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setConfirmLeaveOpen(true)}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Leave group
                </Button>
              )}
            </section>

            <InviteMemberModal
              open={inviteOpen}
              onOpenChange={setInviteOpen}
              groupId={group.id}
              groupName={group.name}
            />

            <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave this group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll lose access to the shared board. You can rejoin only
                    via a new invite.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={leaveMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      leaveMutation.mutate();
                    }}
                    disabled={leaveMutation.isPending}
                  >
                    {leaveMutation.isPending ? "Leaving..." : "Leave group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={confirmDeleteOpen}
              onOpenChange={setConfirmDeleteOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the group for all members. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;
