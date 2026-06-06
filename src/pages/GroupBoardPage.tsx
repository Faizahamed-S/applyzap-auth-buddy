import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { GroupsApiError } from "@/lib/groupsApi";
import {
  groupJobsApi,
  nextStatus,
  type GroupJob,
  type GroupJobStatus,
} from "@/lib/groupJobsApi";
import { userApi } from "@/lib/userApi";
import {
  isTutorialDismissed,
  dismissTutorial,
  sampleGroupBoard,
} from "@/lib/collabTutorialSamples";
import { GroupBoardGrid } from "@/components/groups/GroupBoardGrid";
import { AddGroupJobModal } from "@/components/groups/AddGroupJobModal";

const GroupBoardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { groupId } = useParams<{ groupId: string }>();
  const [authLoading, setAuthLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(() =>
    isTutorialDismissed(),
  );
  const [pendingDelete, setPendingDelete] = useState<GroupJob | null>(null);
  const [busyJobId, setBusyJobId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setAuthLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const boardKey = ["groupBoard", String(groupId)];

  const boardQuery = useQuery({
    queryKey: boardKey,
    queryFn: () => groupJobsApi.getBoard(groupId!),
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
    if (!boardQuery.isError) return;
    const err = boardQuery.error;
    if (err instanceof GroupsApiError) {
      if (err.status === 401) toast.error("Please sign in again");
      else if (err.status === 403) toast.error("You aren't a member of this group.");
      else if (err.status === 404) toast.error("Group not found");
      else toast.error("Couldn't load the board. Please try again.");
    } else {
      toast.error("Couldn't load the board. Please try again.");
    }
  }, [boardQuery.isError, boardQuery.error]);

  const board = boardQuery.data;

  const myMemberId = useMemo(() => {
    if (!board || !profileQuery.data?.id) return null;
    const myUserId = Number(profileQuery.data.id);
    if (Number.isNaN(myUserId)) return null;
    const me = board.members.find((m) => m.userId === myUserId);
    return me?.memberId ?? null;
  }, [board, profileQuery.data?.id]);

  const statusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: number; status: GroupJobStatus }) =>
      groupJobsApi.setStatus(groupId!, jobId, status),
    onMutate: ({ jobId }) => setBusyJobId(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey });
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403) return toast.error("You can't update that cell.");
        if (err.status === 404) return toast.error("Job not found");
        if (err.status >= 500) return toast.error("Couldn't update status. Please try again.");
        return toast.error(err.message || "Couldn't update status.");
      }
      toast.error("Network error. Please try again.");
    },
    onSettled: () => setBusyJobId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: number) => groupJobsApi.deleteJob(groupId!, jobId),
    onMutate: (jobId) => setBusyJobId(jobId),
    onSuccess: () => {
      toast.success("Job removed");
      queryClient.invalidateQueries({ queryKey: boardKey });
      setPendingDelete(null);
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) return toast.error("Please sign in again");
        if (err.status === 403) return toast.error("You can't delete this job.");
        if (err.status === 404) return toast.error("Job not found");
        if (err.status >= 500) return toast.error("Couldn't delete job. Please try again.");
        return toast.error(err.message || "Couldn't delete job.");
      }
      toast.error("Network error. Please try again.");
    },
    onSettled: () => setBusyJobId(null),
  });

  const handleCycleMyStatus = (job: GroupJob, current: GroupJobStatus) => {
    if (myMemberId == null) return;
    statusMutation.mutate({ jobId: job.jobId, status: nextStatus(current) });
  };

  const handleDismissTutorial = () => {
    dismissTutorial();
    setTutorialDismissed(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const isEmpty = !!board && board.jobs.length === 0;
  const showTutorial = isEmpty && !tutorialDismissed;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] w-[92%] mx-auto py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
            Back to groups
          </Link>
        </Button>

        {boardQuery.isLoading ? (
          <Card className="border border-border bg-card animate-pulse">
            <CardContent className="p-10 h-60" />
          </Card>
        ) : boardQuery.isError ? (
          <Card className="border border-border bg-card">
            <CardContent className="p-10 text-center space-y-3">
              <p className="text-foreground font-medium">
                {boardQuery.error instanceof GroupsApiError &&
                boardQuery.error.status === 404
                  ? "Group not found"
                  : boardQuery.error instanceof GroupsApiError &&
                    boardQuery.error.status === 403
                  ? "You aren't a member of this group."
                  : "Couldn't load the board."}
              </p>
              <Button asChild variant="secondary">
                <Link to="/groups">Back to groups</Link>
              </Button>
            </CardContent>
          </Card>
        ) : board ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {board.name} — Board
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Each member tracks their own status per job. Click your own
                  cell to cycle: NA → APPLIED → EXPIRED.
                </p>
              </div>
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add job
              </Button>
            </div>

            {board.jobs.length > 0 ? (
              <GroupBoardGrid
                board={board}
                myMemberId={myMemberId}
                onCycleMyStatus={handleCycleMyStatus}
                onDeleteJob={(j) => setPendingDelete(j)}
                busyJobId={busyJobId}
              />
            ) : (
              <Card className="border border-border bg-card">
                <CardContent className="p-10 text-center space-y-3">
                  <p className="text-foreground font-medium">No jobs yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add a job link to start tracking as a group.
                  </p>
                  <Button onClick={() => setAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add your first job
                  </Button>
                </CardContent>
              </Card>
            )}

            {showTutorial && (
              <section className="space-y-3 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Example preview</Badge>
                    <p className="text-sm text-muted-foreground">
                      This is how your group board will look. Data is not saved.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissTutorial}
                    className="gap-2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    Dismiss example
                  </Button>
                </div>
                <GroupBoardGrid
                  board={sampleGroupBoard}
                  myMemberId={-1}
                  readOnly
                />
              </section>
            )}

            <AddGroupJobModal
              open={addOpen}
              onOpenChange={setAddOpen}
              groupId={board.id}
            />

            <AlertDialog
              open={!!pendingDelete}
              onOpenChange={(o) => !o && setPendingDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the job for everyone in the group, including
                    all member statuses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      if (pendingDelete) deleteMutation.mutate(pendingDelete.jobId);
                    }}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Removing..." : "Remove job"}
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

export default GroupBoardPage;
