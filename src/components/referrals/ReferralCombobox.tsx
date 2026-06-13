import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useReferrals } from '@/hooks/useReferrals';
import { AddEditReferralModal } from './AddEditReferralModal';

interface ReferralComboboxProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export const ReferralCombobox = ({ value, onChange }: ReferralComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { data: referrals = [], isLoading } = useReferrals();

  const selected = referrals.find((r) => r.id === value) ?? null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between font-normal"
            >
              <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                {selected
                  ? `${selected.name}${selected.companyName ? ` · ${selected.companyName}` : ''}`
                  : isLoading
                    ? 'Loading referrals…'
                    : 'Select a referral'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search by name or company…" />
              <CommandList>
                <CommandEmpty>
                  <div className="text-sm text-muted-foreground py-2">No referral found.</div>
                </CommandEmpty>
                <CommandGroup>
                  {referrals.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={`${r.name} ${r.companyName ?? ''}`}
                      onSelect={() => {
                        onChange(r.id === value ? null : r.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          r.id === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        {r.companyName && (
                          <span className="text-xs text-muted-foreground">{r.companyName}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setAddOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add new referral
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selected && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            aria-label="Clear referral"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AddEditReferralModal
        open={addOpen}
        onOpenChange={setAddOpen}
        referral={null}
        onCreated={(r) => onChange(r.id)}
      />
    </>
  );
};
