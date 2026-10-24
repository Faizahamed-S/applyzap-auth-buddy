import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAnalyticsApplications } from '@/hooks/useAnalyticsApplications';
import { referralEffectiveness } from '@/lib/applicationAnalytics';

export const ReferralEffectivenessCard = () => {
  const { data, isLoading, isError, refetch } = useAnalyticsApplications();
  const rows = referralEffectiveness(data ?? []);
  return <Card className="min-w-0 border-border bg-card">
    <CardHeader><CardTitle className="text-lg">Referral effectiveness</CardTitle></CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-[180px] w-full" /> : isError ? (
        <div className="flex h-[180px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground" role="alert">Couldn't load referral effectiveness.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : !data?.length ? (
        <div className="flex h-[180px] items-center justify-center text-muted-foreground">No data yet</div>
      ) : <Table>
        <TableHeader><TableRow>
          <TableHead className="px-2">Jobs</TableHead>
          <TableHead className="px-2 text-right">Total</TableHead>
          <TableHead className="px-2 text-right">Interview / offer</TableHead>
          <TableHead className="px-2 text-right">Rate</TableHead>
        </TableRow></TableHeader>
        <TableBody>{rows.map(row => <TableRow key={String(row.referral)}>
          <TableCell className="px-2 font-medium">{row.referral ? 'Referral' : 'Non-referral'}</TableCell>
          <TableCell className="px-2 text-right tabular-nums">{row.total}</TableCell>
          <TableCell className="px-2 text-right tabular-nums">{row.progressed}</TableCell>
          <TableCell className="px-2 text-right font-semibold tabular-nums text-primary">{row.percent}%</TableCell>
        </TableRow>)}</TableBody>
      </Table>}
    </CardContent>
  </Card>;
};