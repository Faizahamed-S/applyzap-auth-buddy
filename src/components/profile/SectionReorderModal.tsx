import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export interface SectionOrderItem {
  id: string;
  label: string;
}

interface SectionReorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: SectionOrderItem[];
  onSave: (sections: SectionOrderItem[]) => void;
}

const SectionReorderModal = ({ open, onOpenChange, sections, onSave }: SectionReorderModalProps) => {
  const [draft, setDraft] = useState<SectionOrderItem[]>(sections);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setDraft(sections);
    onOpenChange(isOpen);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reorder Sections</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">Drag sections up or down to change the order they appear on your profile.</p>
        <div className="space-y-1 mt-2">
          {draft.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                disabled={i === draft.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSave(draft); onOpenChange(false); }}>Save Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SectionReorderModal;
