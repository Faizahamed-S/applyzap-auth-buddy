import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { userApi } from '@/lib/userApi';
import { toast } from 'sonner';

const AVAILABLE_COLORS = [
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
];

interface ColumnConfig {
  id: string;
  title: string;
  color: string;
}

interface BoardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnConfig[];
}

export const BoardSettingsModal = ({ open, onOpenChange, columns: initialColumns }: BoardSettingsModalProps) => {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setColumns(initialColumns.map(c => ({ ...c })));
      setDeleteConfirmId(null);
    }
  }, [open, initialColumns]);

  const saveMutation = useMutation({
    mutationFn: () => userApi.updateProfile({ trackerConfig: { columns } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Board columns updated!');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to save board settings');
    },
  });

  const generateId = () => `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const addColumn = () => {
    setColumns(prev => [...prev, { id: generateId(), title: '', color: 'gray' }]);
  };

  const updateColumn = (index: number, field: keyof ColumnConfig, value: string) => {
    setColumns(prev => prev.map((col, i) => (i === index ? { ...col, [field]: value } : col)));
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 1) {
      toast.error('You must have at least one column');
      return;
    }
    setColumns(prev => prev.filter((_, i) => i !== index));
    setDeleteConfirmId(null);
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= columns.length) return;
    setColumns(prev => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleSave = () => {
    const emptyTitles = columns.some(c => !c.title.trim());
    if (emptyTitles) {
      toast.error('All columns must have a title');
      return;
    }
    const titles = columns.map(c => c.title.trim().toLowerCase());
    const hasDuplicates = new Set(titles).size !== titles.length;
    if (hasDuplicates) {
      toast.error('Column titles must be unique');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          <Label className="text-sm text-muted-foreground">
            Customize your board columns. Drag to reorder.
          </Label>

          {columns.map((col, index) => (
            <div key={col.id} className="flex items-center gap-2 rounded-lg border bg-card p-3">
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveColumn(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveColumn(index, 1)}
                  disabled={index === columns.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

              <Input
                value={col.title}
                onChange={(e) => updateColumn(index, 'title', e.target.value)}
                placeholder="Column title"
                className="flex-1"
                maxLength={50}
              />

              <Select value={col.color} onValueChange={(v) => updateColumn(index, 'color', v)}>
                <SelectTrigger className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${AVAILABLE_COLORS.find(c => c.value === col.color)?.class || 'bg-gray-500'}`} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {AVAILABLE_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {deleteConfirmId === col.id ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => removeColumn(index)}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteConfirmId(col.id)}
                  disabled={columns.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addColumn}>
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
