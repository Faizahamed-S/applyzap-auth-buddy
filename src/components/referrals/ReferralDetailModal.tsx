import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Calendar,
  Edit2,
  Linkedin,
  Mail,
  Phone,
  StickyNote,
  Tag,
  UserCircle,
} from 'lucide-react';
import { Referral } from '@/types/referral';
import { referralApi } from '@/lib/referralApi';
import { useReferralTemplate } from '@/hooks/useReferrals';
import { ApplicationDetailModal } from '@/components/kanban/ApplicationDetailModal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: Referral | null;
  onEdit: (r: Referral) => void;
}

export const ReferralDetailModal = ({ open, onOpenChange, referral, onEdit }: Props) => {
  const { data: template } = useReferralTemplate();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Fetch the full referral (with server-populated associatedApplications).
  const { data: fullReferral } = useQuery({
    queryKey: ['referral', referral?.id],
    queryFn: () => referralApi.get(referral!.id),
    enabled: open && !!referral,
  });

  if (!referral) return null;

  const view = fullReferral ?? referral;
  const linked = view.associatedApplications ?? [];

  const customEntries = template?.fields
    .map((f) => ({ label: f.label, value: view.customFields?.[f.key] }))
    .filter((e) => e.value && e.value.trim() !== '');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              Referral Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{view.name}</h2>
              {view.companyName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{view.companyName}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {view.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground shrink-0">Email</span>
                  <span className="text-muted-foreground">:</span>
                  <a
                    href={`mailto:${view.email}`}
                    className="text-primary hover:underline truncate"
                  >
                    {view.email}
                  </a>
                </div>
              )}
              {view.mobile && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground shrink-0">Mobile</span>
                  <span className="text-muted-foreground">:</span>
                  <a
                    href={`tel:${view.mobile}`}
                    className="text-foreground hover:underline truncate"
                  >
                    {view.mobile}
                  </a>
                </div>
              )}
              {view.linkedinUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground shrink-0">LinkedIn</span>
                  <span className="text-muted-foreground">:</span>
                  <a
                    href={view.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {view.linkedinUrl}
                  </a>
                </div>
              )}
            </div>

            {customEntries && customEntries.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Custom Fields
                </label>
                <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 gap-3">
                  {customEntries.map((e) => (
                    <div key={e.label} className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">{e.label}</div>
                      <div className="text-sm text-foreground">{e.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view.notes && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <StickyNote className="h-4 w-4" />
                  Notes
                </label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap text-sm">{view.notes}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Associated Applications</h3>
              {linked.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                  No applications linked yet.
                </div>
              ) : (
                <div className="border border-border rounded-lg divide-y divide-border">
                  {linked.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedAppId(app.id)}
                      className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground capitalize truncate">
                          {app.companyName}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize truncate">
                          {app.roleName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(app.dateOfApplication).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => onEdit(view)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ApplicationDetailModal
        open={!!selectedAppId}
        onOpenChange={(o) => !o && setSelectedAppId(null)}
        applicationId={selectedAppId}
        onEdit={() => setSelectedAppId(null)}
        onDelete={() => setSelectedAppId(null)}
      />
    </>
  );
};
