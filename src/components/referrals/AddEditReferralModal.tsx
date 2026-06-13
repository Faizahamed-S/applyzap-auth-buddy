import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Referral } from '@/types/referral';
import {
  useCreateReferral,
  useReferralTemplate,
  useUpdateReferral,
} from '@/hooks/useReferrals';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  companyName: z.string().trim().max(120).optional(),
  mobile: z.string().trim().max(40).optional(),
  email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: Referral | null;
  onCreated?: (r: Referral) => void;
}

export const AddEditReferralModal = ({ open, onOpenChange, referral, onCreated }: Props) => {
  const { data: template } = useReferralTemplate();
  const create = useCreateReferral();
  const update = useUpdateReferral();
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      companyName: '',
      mobile: '',
      email: '',
      linkedinUrl: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (referral) {
      form.reset({
        name: referral.name,
        companyName: referral.companyName ?? '',
        mobile: referral.mobile ?? '',
        email: referral.email ?? '',
        linkedinUrl: referral.linkedinUrl ?? '',
        notes: referral.notes ?? '',
      });
      setCustomValues(referral.customFields ?? {});
    } else {
      form.reset({
        name: '',
        companyName: '',
        mobile: '',
        email: '',
        linkedinUrl: '',
        notes: '',
      });
      setCustomValues({});
    }
  }, [open, referral, form]);

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      companyName: values.companyName || undefined,
      mobile: values.mobile || undefined,
      email: values.email || undefined,
      linkedinUrl: values.linkedinUrl || undefined,
      notes: values.notes || undefined,
      customFields: Object.fromEntries(
        Object.entries(customValues).filter(([, v]) => v && v.trim() !== ''),
      ),
    };
    try {
      if (referral) {
        await update.mutateAsync({ id: referral.id, patch: payload });
        toast.success('Referral updated');
      } else {
        const created = await create.mutateAsync(payload);
        toast.success('Referral added');
        onCreated?.(created);
      }
      onOpenChange(false);
    } catch (e) {
      toast.error('Could not save referral');
    }
  };

  const submitting = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{referral ? 'Edit Referral' : 'Add Referral'}</DialogTitle>
          <DialogDescription>
            Keep your network organised. Contact info stays private to your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How you met, context, what they specialise in…"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {template && template.fields.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <label className="text-sm font-medium">Custom Fields</label>
                  <div className="grid grid-cols-2 gap-3">
                    {template.fields.map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">{f.label}</label>
                        <Input
                          value={customValues[f.key] ?? ''}
                          onChange={(e) =>
                            setCustomValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                          placeholder={f.label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : referral ? 'Save Changes' : 'Add Referral'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
