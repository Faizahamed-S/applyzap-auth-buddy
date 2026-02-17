import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

const SortableItem = ({ id, children, className = '' }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-start gap-2 ${className}`}>
      <button
        type="button"
        className="mt-2 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 shrink-0 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default SortableItem;
