import { Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { heatLevel, dayLabel } from '@/lib/analyticsMath';
import { cn } from '@/lib/utils';

const LEVEL_CLASS = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary'];

const Stat = ({ icon: Icon, label, value, iconClass }: { icon: React.ElementType; label: string; value: number; iconClass: string }) => (
  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
    <div className={cn('p-2.5 rounded-xl bg-muted', iconClass)}><Icon className="h-5 w-5" /></div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold text-foreground leading-tight">
        {value} <span className="text-base font-medium text-muted-foreground">{value === 1 ? 'day' : 'days'}</span>
      </p>
    </div>
  </div>
);

export const ConsistencyCard = () => {
  const { data, isLoading } = useDashboardAnalytics();
  const days = data?.activity_by_day_last_30 ?? [];
  const max = Math.max(0, ...days.map((d) => Number(d.count) || 0));

  // Offset first column so rows line up with weekdays (Sun at top), like GitHub.
  const firstDow = days.length ? new Date(`${String(days[0].date).slice(0, 10)}T00:00:00`).getDay() : 0;
  const offset = Number.isFinite(firstDow) ? firstDow : 0;

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Consistency</CardTitle>
        <p className="text-sm text-muted-foreground">Active days over the last 30 days</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : !data ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Stat icon={Flame} label="Current streak" value={data.summary?.current_streak ?? 0} iconClass="text-primary" />
              <Stat icon={Trophy} label="Longest streak" value={data.summary?.longest_streak ?? 0} iconClass="text-zap" />
            </div>

            {days.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">No data yet</div>
            ) : (
              <TooltipProvider delayDuration={100}>
                <div className="overflow-x-auto">
                  <div className="grid grid-rows-[repeat(7,1rem)] grid-flow-col gap-1 w-max">
                    {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} className="h-4 w-4" />)}
                    {days.map((d) => {
                      const count = Number(d.count) || 0;
                      return (
                        <Tooltip key={d.date}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn('h-4 w-4 rounded-sm', LEVEL_CLASS[heatLevel(count, max)])}
                              aria-label={`${dayLabel(d.date)}: ${count}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {dayLabel(d.date)} · {count} {count === 1 ? 'activity' : 'activities'}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-2">
                  Less
                  {LEVEL_CLASS.map((c) => <div key={c} className={cn('h-3 w-3 rounded-sm', c)} />)}
                  More
                </div>
              </TooltipProvider>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
