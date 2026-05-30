import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { groupsApi, GroupsApiError } from "@/lib/groupsApi";
import { refreshGroupsCache } from "@/lib/groupsCache";

const InviteAcceptPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [authChecking, setAuthChecking] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const returnTo = encodeURIComponent(`/invite/${token ?? ""}`);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
        return;
      }
      setSessionEmail(session.user.email ?? null);
      setAuthChecking(false);
    };
    check();
  }, [navigate, token]);

  const infoQuery = useQuery({
    queryKey: ["inviteInfo", token],
    queryFn: () => groupsApi.getInviteInfo(token!),
    enabled: !authChecking && !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => groupsApi.acceptInvite(token!),
    onSuccess: () => {
      toast.success(`Joined ${infoQuery.data?.groupName ?? "group"}`);
      refreshGroupsCache();
      // TODO: navigate to /groups/{id} once backend returns groupId in invite info or accept response.
      navigate("/groups");
    },
    onError: (err: unknown) => {
      if (err instanceof GroupsApiError) {
        if (err.status === 401) {
          const returnTo = encodeURIComponent(`/invite/${token ?? ""}`);
          toast.error("Please sign in again");
          navigate(`/login?returnTo=${returnTo}`, { replace: true });
          return;
        }
        if (err.status === 404 || err.status === 410)
          return toast.error("This invite is no longer valid.");
        if (err.status === 409) {
          toast.message("You're already a member.");
          navigate("/groups");
          return;
        }
        if (err.status >= 500) return toast.error("Couldn't accept invite. Please try again.");
        return toast.error(err.message || "Couldn't accept invite.");
      }
      toast.error("Network error. Please try again.");
    },
  });

  const handleSignOutAndRelogin = async () => {
    await supabase.auth.signOut();
    const returnTo = encodeURIComponent(`/invite/${token ?? ""}`);
    navigate(`/login?returnTo=${returnTo}`, { replace: true });
  };

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const info = infoQuery.data;
  const wrongAccount =
    info && sessionEmail && info.email.toLowerCase() !== sessionEmail.toLowerCase();
  const invalid = info && info.valid === false;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl">
          {infoQuery.isLoading ? (
            <CardContent className="p-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          ) : infoQuery.isError ? (
            <>
              <CardHeader>
                <CardTitle>Invite unavailable</CardTitle>
                <CardDescription>
                  {infoQuery.error instanceof GroupsApiError &&
                  (infoQuery.error.status === 404 || infoQuery.error.status === 410)
                    ? "This invite is no longer valid or has expired."
                    : "Couldn't load this invite. Please try again."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/groups">Go to groups</Link>
                </Button>
              </CardContent>
            </>
          ) : info ? (
            <>
              <CardHeader>
                <CardTitle>Join {info.groupName}</CardTitle>
                <CardDescription>
                  {info.inviterName} invited{" "}
                  <span className="font-medium text-foreground">{info.email}</span>{" "}
                  to collaborate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invalid && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Invite no longer valid</AlertTitle>
                    <AlertDescription>
                      Ask the group owner to send a new invite.
                    </AlertDescription>
                  </Alert>
                )}
                {!invalid && wrongAccount && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Wrong account</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        This invite is for{" "}
                        <span className="font-medium">{info.email}</span>, but
                        you're signed in as{" "}
                        <span className="font-medium">{sessionEmail}</span>.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSignOutAndRelogin}
                      >
                        Sign out and switch account
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => navigate("/groups")}
                    disabled={acceptMutation.isPending}
                  >
                    Decline
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => acceptMutation.mutate()}
                    disabled={
                      acceptMutation.isPending || !!invalid || !!wrongAccount
                    }
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {acceptMutation.isPending ? "Joining..." : "Accept invite"}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
