import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';
import { jobApi } from '@/lib/jobApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ClipboardCheck, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export const DashboardHub = () => {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: analyticsApi.getDashboardAnalytics,
  });

  const { data: recentApps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => jobApi.getAllApplications(undefined, 1, 5),
  });

  const summary = analytics?.summary;
  const successRate = summary && summary.totalApplications > 0
    ? Math.round((summary.interviews / summary.totalApplications) * 100)
    : 0;

  const statsCards = [
    {
      title: 'Total Applied',
      value: summary?.totalApplications ?? '—',
      icon: Briefcase,
      color: 'text-primary',
    },
    {
      title: 'In Review',
      value: summary?.statusCounts?.['In Review'] ?? 0,
      icon: ClipboardCheck,
      color: 'text-accent',
    },
    {
      title: 'Interviews',
      value: summary?.interviews ?? 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-zap',
    },
  ];

  const chartData = (analytics?.recent_activity ?? []).map(item => ({
    date: (() => {
      try { return format(parseISO(item.date), 'MMM d'); } catch { return item.date; }
    })(),
    count: item.count,
  }));

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-[90%] mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your job search at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card key={card.title} className="border border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Velocity Chart */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Application Velocity</CardTitle>
          <p className="text-sm text-muted-foreground">Applications submitted over recent days</p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No activity data yet. Start applying!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentApps.length > 0 ? (
            <div className="space-y-3">
              {recentApps.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Company initial */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {(app.companyName || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{app.companyName}</p>
                    <p className="text-sm text-muted-foreground truncate">{app.roleName}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No applications yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
