import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";
import { GroupCard } from "./GroupCard";
import { CreateGroupModal } from "./CreateGroupModal";
import { TutorialPreview } from "./TutorialPreview";
import { isTutorialDismissed } from "@/lib/collabTutorialSamples";

export const MyGroupsHub = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(() =>
    isTutorialDismissed(),
  );

  const { data: groups, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.listGroups,
    retry: false,
  });

  useEffect(() => {
    if (!isError) return;
    if (error instanceof GroupsApiError && error.status === 401) {
      toast.error("Please sign in again");
    } else if (error instanceof GroupsApiError && error.status >= 500) {
      toast.error("Couldn't load groups. Please try again.");
    } else {
      toast.error("Couldn't load groups. Please try again.");
    }
  }, [isError, error]);

  const showTutorial =
    !isLoading && !isError && (!groups || groups.length === 0) && !tutorialDismissed;

  return (
    <div className="max-w-[1400px] w-[90%] mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Groups</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with others on your job search.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Group
        </Button>
      </div>

      {showTutorial && (
        <TutorialPreview onDismiss={() => setTutorialDismissed(true)} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border border-border bg-card animate-pulse">
              <CardContent className="p-6 h-32" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border border-border bg-card">
          <CardContent className="p-10 text-center space-y-3">
            <p className="text-foreground font-medium">Couldn't load your groups.</p>
            <Button onClick={() => refetch()} disabled={isRefetching} variant="secondary">
              {isRefetching ? "Retrying..." : "Try again"}
            </Button>
          </CardContent>
        </Card>
      ) : !groups || groups.length === 0 ? (
        <Card className="border border-border bg-card">
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-foreground font-medium">No groups yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first group to start collaborating.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}

      <CreateGroupModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
