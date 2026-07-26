import { Linkedin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Referral } from '@/types/referral';

interface Props {
  referral: Referral;
  onSelect: (r: Referral) => void;
  onEdit: (r: Referral) => void;
  onDelete: (r: Referral) => void;
}

export const ReferralCard = ({ referral, onSelect, onEdit, onDelete }: Props) => {
  const linkedCount = referral.associatedApplications?.length ?? 0;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(referral)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(referral);
        }
      }}
      className="group relative rounded-lg border border-border bg-card p-4 cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <h3 className="text-base font-bold text-white truncate">
            {referral.companyName || 'Unknown company'}
          </h3>
          <p className="text-sm font-medium text-foreground truncate">
            {referral.name}
          </p>
          {referral.email && (
            <p className="text-xs text-muted-foreground truncate">
              {referral.email}
            </p>
          )}
        </div>
        <div onClick={stop}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(referral)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(referral)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/60">
        {referral.linkedinUrl ? (
          <a
            href={referral.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No LinkedIn</span>
        )}
        {linkedCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {linkedCount} linked
          </span>
        )}
      </div>
    </div>
  );
};
