import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Trophy } from 'lucide-react';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { useGroupAnalytics } from '@/hooks/useGroupAnalytics';
import { buildContributorLeaderboard } from '@/lib/groupAnalyticsMath';

const config: ChartConfig = {
  jobsAdded: { label: 'Jobs added', color: 'hsl(var(--accent))' },
  leader: { label: 'Top contributor', color: 'hsl(var(--primary))' },
};

export const ContributorsCard = ({ groupId }: { groupId: string | number }) => {
  const [mode, setMode] = useState<'overall' | 'day'>('overall');
  const [date, setDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGroupAnalytics(
    groupId, mode === 'day' ? format(date, 'yyyy-MM-dd') : undefined,
  );
  const items = buildContributorLeaderboard(data, mode);
  const leader = items.find(item => item.isTop);
  const hasActivity = items.some(item => item.jobsAdded > 0);

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">Contributors</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={mode} onValueChange={value => setMode(value === 'day' ? 'day' : 'overall')}>
              <TabsList aria-label="Contribution period">
                <TabsTrigger value="overall">All time</TabsTrigger>
                <TabsTrigger value="day">Selected day</TabsTrigger>
              </TabsList>
            </Tabs>
            {mode === 'day' && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2 font-normal" aria-label="Choose contribution date">
                    <CalendarIcon className="h-4 w-4" />
                    {format(date, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
                  <Calendar
                    mode="single" selected={date} initialFocus
                    onSelect={selected => {
                      if (!selected) return;
                      setDate(selected);
                      setCalendarOpen(false);
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        {!isError && (
          <dl className="grid grid-cols-2 gap-4 border-b border-border pb-4">
            {[{ label: 'Total jobs', value: data?.totalJobs }, { label: 'Jobs added today', value: data?.jobsAddedToday }].map(stat => (
              <div key={stat.label}>
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tabular-nums">
                  {isLoading ? <Skeleton className="h-9 w-20" /> : (stat.value ?? 0).toLocaleString()}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        {isLoading ? <Skeleton className="h-[200px] w-full" /> : isError ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground" role="alert">Couldn't load contributors.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : !hasActivity ? (
          <div className="flex h-[160px] items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <>
            {leader && (
              <p className="mb-4 flex min-w-0 items-center gap-2 text-sm text-primary">
                <Trophy className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">Top contributor · <span className="font-semibold">{leader.displayName}</span></span>
              </p>
            )}
            <ChartContainer config={config} className="w-full aspect-auto" style={{ height: Math.max(160, items.length * 40 + 20) }}>
              <BarChart data={items} layout="vertical" margin={{ left: 0, right: 40 }} accessibilityLayer>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="memberId" width={110} tickLine={false} axisLine={false} fontSize={12}
                  tickFormatter={id => {
                    const name = items.find(item => item.memberId === Number(id))?.displayName ?? '';
                    return name.length > 16 ? `${name.slice(0, 15)}…` : name;
                  }}
                />
                <ChartTooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as typeof items[number];
                  return <div className="max-w-64 break-words rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md">
                    <p className="font-medium">{item.displayName}</p>
                    <p className="text-muted-foreground">{item.jobsAdded} job{item.jobsAdded === 1 ? '' : 's'} added</p>
                  </div>;
                }} />
                <Bar dataKey="jobsAdded" barSize={22} radius={[0, 6, 6, 0]}>
                  {items.map(item => <Cell key={item.memberId} fill={item.isTop ? 'var(--color-leader)' : 'var(--color-jobsAdded)'} />)}
                  <LabelList dataKey="jobsAdded" position="right" className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
};