import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { buildDonut, type DonutSegment } from '@/lib/analyticsMath';

const config: ChartConfig = {
  yes: { label: 'Yes', color: 'hsl(var(--primary))' },
  no: { label: 'No', color: 'hsl(var(--muted))' },
};

const Donut = ({
  title,
  yesLabel,
  noLabel,
  part,
  total,
}: {
  title: string;
  yesLabel: string;
  noLabel: string;
  part: number;
  total: number;
}) => {
  const segments = useMemo(() => buildDonut(part, total, yesLabel, noLabel), [part, total, yesLabel, noLabel]);
  const yes = segments[0];
  const no = segments[1];
  const hasData = total > 0;
  // With zero applications recharts draws nothing, so show a flat grey ring instead.
  const data = hasData ? segments : [{ key: 'no' as const, label: noLabel, count: 1, percent: 0 }];
  const bothFilled = yes.count > 0 && no.count > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[150px] w-[150px]">
        <ChartContainer config={config} className="h-full w-full aspect-auto">
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length || !hasData) return null;
                const p = payload[0].payload as DonutSegment;
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
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={bothFilled ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((s) => (
                <Cell key={s.key} fill={`var(--color-${s.key})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground tabular-nums">{hasData ? `${yes.percent}%` : '0%'}</span>
          <span className="text-[11px] text-muted-foreground">{hasData ? `${yes.count} of ${total}` : 'no data'}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            {yesLabel} · {yes.count}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            {noLabel} · {no.count}
          </span>
        </div>

      </div>
    </div>
  );
};

export const ReferralTailoredCard = () => {
  const { data, isLoading } = useDashboardAnalytics();
  const s = data?.summary;
  const total = s?.totalApplications ?? 0;

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Referral &amp; Tailored</CardTitle>
        <p className="text-sm text-muted-foreground">Share of applications with a referral or a tailored version</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : !s ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Donut title="Referral" yesLabel="Referral" noLabel="No referral" part={s.referral_count ?? 0} total={total} />
            <Donut title="Tailored" yesLabel="Tailored" noLabel="Not tailored" part={s.tailored_count ?? 0} total={total} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
