import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { fillHours, fillLastNDays, monthLabel, dayLabel, type ActivityPoint } from '@/lib/analyticsMath';

type Range = 'today' | 'week' | 'month' | 'year';
const config: ChartConfig = { count: { label: 'Activity', color: 'hsl(var(--primary))' } };

const TooltipBox = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ActivityPoint;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{p.label}</p>
      <p className="text-muted-foreground">{p.count} {p.count === 1 ? 'activity' : 'activities'}</p>
    </div>
  );
};

export const ActivityChart = () => {
  const { data, isLoading } = useDashboardAnalytics();
  const [range, setRange] = useState<Range>('week');

  const points = useMemo<ActivityPoint[]>(() => {
    if (!data) return [];
    switch (range) {
      case 'today':
        return data.activity_by_hour_today ? fillHours(data.activity_by_hour_today) : [];
      case 'week':
        return fillLastNDays(data.recent_activity, 7);
      case 'month':
        return (data.activity_by_day_last_30 ?? []).map((r) => ({ label: dayLabel(r.date), count: Number(r.count) || 0 }));
      case 'year':
        return (data.activity_by_month_last_12 ?? []).map((r) => ({ label: monthLabel(r.month), count: Number(r.count) || 0 }));
    }
  }, [data, range]);

  const empty = points.length === 0 || points.every((p) => p.count === 0);
  const axis = { stroke: 'hsl(var(--muted-foreground))', fontSize: 12, tickLine: false, axisLine: false } as const;

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg text-foreground">Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Jobs added + status changes</p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : empty ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <ChartContainer config={config} className="h-[240px] w-full aspect-auto">
            {range === 'month' ? (
              <AreaChart data={points} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} minTickGap={16} />
                <YAxis {...axis} allowDecimals={false} />
                <ChartTooltip content={<TooltipBox />} />
                <Area dataKey="count" type="monotone" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={points} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} interval={range === 'today' ? 2 : 'preserveStartEnd'} minTickGap={4} />
                <YAxis {...axis} allowDecimals={false} />
                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<TooltipBox />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
