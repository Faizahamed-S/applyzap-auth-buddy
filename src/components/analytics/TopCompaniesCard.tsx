import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { useAnalyticsApplications } from '@/hooks/useAnalyticsApplications';
import { topCompanies } from '@/lib/applicationAnalytics';

const config: ChartConfig = { count: { label: 'Applications', color: 'hsl(var(--primary))' } };

export const TopCompaniesCard = () => {
  const { data, isLoading, isError, refetch } = useAnalyticsApplications();
  const items = topCompanies(data ?? []);
  return <Card className="min-w-0 border-border bg-card">
    <CardHeader><CardTitle className="text-lg">Top Companies</CardTitle></CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-[360px] w-full" /> : isError ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground" role="alert">Couldn't load companies.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-muted-foreground">No data yet</div>
      ) : <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(160, items.length * 36 + 20) }}>
        <BarChart data={items} layout="vertical" margin={{ left: 0, right: 35 }} accessibilityLayer>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="company" width={115} tickLine={false} axisLine={false} fontSize={12}
            tickFormatter={name => name.length > 17 ? `${name.slice(0, 16)}…` : name} />
          <ChartTooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as typeof items[number];
            return <div className="max-w-64 break-words rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md">
              <p className="font-medium">{item.company}</p>
              <p className="text-muted-foreground">{item.count} application{item.count === 1 ? '' : 's'}</p>
            </div>;
          }} />
          <Bar dataKey="count" fill="var(--color-count)" barSize={20} radius={[0, 6, 6, 0]}>
            <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
          </Bar>
        </BarChart>
      </ChartContainer>}
    </CardContent>
  </Card>;
};