import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KpiRow } from '@/components/analytics/KpiRow';
import { StatusBreakdownChart } from "@/components/analytics/StatusBreakdownChart";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ConsistencyCard } from "@/components/analytics/ConsistencyCard";
import { ReferralTailoredCard } from "@/components/analytics/ReferralTailoredCard";
import { TopCompaniesCard } from '@/components/analytics/TopCompaniesCard';
import { ReferralEffectivenessCard } from '@/components/analytics/ReferralEffectivenessCard';


const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      setLoading(false);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login');
    });
    return () => subscription.unsubscribe();
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
      <div className="max-w-[1400px] w-[90%] mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deeper insight into your job search</p>
        </div>
        <KpiRow />
        {/* Chart grid — charts from src/components/analytics/ go here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusBreakdownChart />
          <ActivityChart />
          <ConsistencyCard />
          <ReferralTailoredCard />
          <TopCompaniesCard />
          <ReferralEffectivenessCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
