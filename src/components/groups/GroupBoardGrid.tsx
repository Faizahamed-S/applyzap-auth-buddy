import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  GroupBoard,
  GroupJob,
  GroupJobStatus,
} from "@/lib/groupJobsApi";
import { statusBadgeClass } from "@/lib/groupJobsApi";

interface Props {
  board: GroupBoard;
  myMemberId: number | null;
  readOnly?: boolean;
  onCycleMyStatus?: (job: GroupJob, current: GroupJobStatus) => void;
  onDeleteJob?: (job: GroupJob) => void;
  busyJobId?: number | null;
}

const getCellStatus = (job: GroupJob, memberId: number): GroupJobStatus => {
  const entry = job.statuses?.find((s) => s.memberId === memberId);
  return entry?.status ?? "NA";
};

export const GroupBoardGrid = ({
  board,
  myMemberId,
  readOnly,
  onCycleMyStatus,
  onDeleteJob,
  busyJobId,
}: Props) => {
  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">Job</TableHead>
            {board.members.map((m) => (
              <TableHead
                key={m.memberId}
                className={cn(
                  "text-center min-w-[120px]",
                  m.memberId === myMemberId && "text-primary",
                )}
              >
                {m.displayName}
                {m.memberId === myMemberId && (
                  <span className="ml-1 text-[10px] uppercase tracking-wide">
                    (you)
                  </span>
                )}
              </TableHead>
            ))}
            {!readOnly && <TableHead className="w-[60px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {board.jobs.map((job) => (
            <TableRow key={job.jobId}>
              <TableCell className="align-top">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-foreground truncate">
                    {job.companyName || "Untitled company"}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {job.roleName || "—"}
                  </span>
                  {job.originalUrl && (
                    <a
                      href={job.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 w-fit"
                    >
                      View posting
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </TableCell>
              {board.members.map((m) => {
                const status = getCellStatus(job, m.memberId);
                const isMine = m.memberId === myMemberId;
                const interactive = !readOnly && isMine && !!onCycleMyStatus;
                return (
                  <TableCell key={m.memberId} className="text-center align-middle">
                    <button
                      type="button"
                      disabled={!interactive || busyJobId === job.jobId}
                      onClick={
                        interactive
                          ? () => onCycleMyStatus!(job, status)
                          : undefined
                      }
                      className={cn(
                        "inline-flex items-center justify-center min-w-[72px] px-2 py-1 rounded text-xs font-medium transition-colors",
                        statusBadgeClass(status),
                        interactive
                          ? "cursor-pointer hover:opacity-80"
                          : "cursor-default",
                      )}
                      title={
                        interactive
                          ? "Click to cycle status"
                          : isMine
                          ? "Your status"
                          : `${m.displayName}'s status (read-only)`
                      }
                    >
                      {status}
                    </button>
                  </TableCell>
                );
              })}
              {!readOnly && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteJob?.(job)}
                    disabled={busyJobId === job.jobId}
                    className="text-muted-foreground hover:text-destructive"
                    title="Remove job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
