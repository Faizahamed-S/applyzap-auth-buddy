import { useMemo, useState } from 'react';
import { Plus, Search, Settings2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Referral } from '@/types/referral';
import { useDeleteReferral, useReferrals } from '@/hooks/useReferrals';
import { ReferralTable } from './ReferralTable';
import { AddEditReferralModal } from './AddEditReferralModal';
import { ReferralDetailModal } from './ReferralDetailModal';
import { CustomFieldsTemplateModal } from './CustomFieldsTemplateModal';

export const ReferralBaseHub = () => {
  const { data: referrals = [], isLoading } = useReferrals();
  const del = useDeleteReferral();

  const [search, setSearch] = useState('');
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editing, setEditing] = useState<Referral | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Referral | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Referral | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return referrals;
    return referrals.filter((r) =>
      [r.name, r.companyName, r.email, r.mobile]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [referrals, search]);

  const openAdd = () => {
    setEditing(null);
    setAddEditOpen(true);
  };

  const openEdit = (r: Referral) => {
    setEditing(r);
    setAddEditOpen(true);
    setDetailOpen(false);
  };

  const openDetail = (r: Referral) => {
    setDetail(r);
    setDetailOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success('Referral deleted');
    } catch {
      toast.error('Could not delete referral');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Referral Base</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your private CRM of contacts who can refer you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setTemplateOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Custom Fields
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Referral
          </Button>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email…"
            className="pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : referrals.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No referrals added yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add the people who can refer you to companies you're targeting.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first referral
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          No referrals match “{search}”.
        </div>
      ) : (
        <ReferralTable
          referrals={filtered}
          onSelect={openDetail}
          onEdit={openEdit}
          onDelete={(r) => setToDelete(r)}
        />
      )}

      <AddEditReferralModal
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        referral={editing}
      />

      <ReferralDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        referral={detail}
        onEdit={openEdit}
      />

      <CustomFieldsTemplateModal open={templateOpen} onOpenChange={setTemplateOpen} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this referral?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} will be removed. Linked applications will keep their reference id
              but no longer resolve to a contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
