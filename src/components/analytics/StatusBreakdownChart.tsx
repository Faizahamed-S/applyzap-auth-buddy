import { useMemo } from 'react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useTrackerColumns } from '@/hooks/useUserProfile';
import { buildStatusBreakdown, type StatusBreakdownItem } from '@/lib/analyticsMath';

const config: ChartConfig = { count: { label: 'Applications', color: 'hsl(var(--primary))' } };

export const StatusBreakdownChart = () => {
  const { data, isLoading } = useDashboardAnalytics();
  const { columns, isLoading: colsLoading } = useTrackerColumns();

  const items = useMemo(
    () => buildStatusBreakdown(data?.summary?.statusCounts, columns.map((c) => c.title)),
    [data, columns],
  );

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Status Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">Applications in each status</p>
      </CardHeader>
      <CardContent>
        {isLoading || colsLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : items.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <ChartContainer config={config} className="w-full aspect-auto" style={{ height: Math.max(160, items.length * 40 + 20) }}>
            <BarChart data={items} layout="vertical" margin={{ left: 8, right: 40 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={110} tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as StatusBreakdownItem;
                  return (
                    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md">
                      <p className="font-medium text-foreground">{p.label}</p>
                      <p className="text-muted-foreground">
                        {p.count} application{p.count === 1 ? '' : 's'} · {p.percent}%
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} barSize={22}>
                <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
