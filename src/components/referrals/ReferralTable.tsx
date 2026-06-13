import { Linkedin, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Referral } from '@/types/referral';

interface Props {
  referrals: Referral[];
  onSelect: (r: Referral) => void;
  onEdit: (r: Referral) => void;
  onDelete: (r: Referral) => void;
}

export const ReferralTable = ({ referrals, onSelect, onEdit, onDelete }: Props) => {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>LinkedIn</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((r) => (
            <TableRow
              key={r.id}
              className="cursor-pointer"
              onClick={() => onSelect(r)}
            >
              <TableCell className="font-semibold text-foreground">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.companyName || '—'}</TableCell>
              <TableCell className="text-muted-foreground">{r.mobile || '—'}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {r.email ? (
                  <a
                    href={`mailto:${r.email}`}
                    className="text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {r.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {r.linkedinUrl ? (
                  <a
                    href={r.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    Profile
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(r)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(r)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
