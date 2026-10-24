import { Briefcase, Users, Trophy, UserPlus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { pct } from '@/lib/analyticsMath';

export const KpiRow = () => {
  const { data, isLoading } = useDashboardAnalytics();
  const s = data?.summary;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!s) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="py-8 text-center text-muted-foreground">No data yet</CardContent>
      </Card>
    );
  }

  const total = s.totalApplications ?? 0;
  const items = [
    { title: 'Total Applications', value: total, icon: Briefcase, iconClass: 'text-primary' },
    { title: 'Interviews', value: s.interviews ?? 0, icon: Users, iconClass: 'text-primary' },
    { title: 'Offers', value: s.offers ?? 0, icon: Trophy, iconClass: 'text-zap' },
    { title: 'Referrals', value: s.referral_count ?? 0, icon: UserPlus, iconClass: 'text-accent', sub: `${pct(s.referral_count, total)}% of total` },
    { title: 'Tailored', value: s.tailored_count ?? 0, icon: Sparkles, iconClass: 'text-primary', sub: `${pct(s.tailored_count, total)}% of total` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {items.map(({ title, value, icon: Icon, iconClass, sub }) => (
        <Card key={title} className="border border-border bg-card">
          <CardContent className="py-4 px-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">{title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
              </div>
              <div className={`p-2.5 rounded-xl bg-muted shrink-0 ${iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
