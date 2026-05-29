import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] w-[90%] mx-auto py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
            Back to groups
          </Link>
        </Button>
        <Card className="border border-border bg-card">
          <CardContent className="p-10 text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Group workspace</h1>
            <p className="text-muted-foreground">
              Group #{groupId} — coming in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;
