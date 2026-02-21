import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'kanban' | 'table';
  onViewChange: (view: 'kanban' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center p-1 bg-muted backdrop-blur-sm border border-border rounded-full">
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          currentView === 'kanban'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        Grouped by Stage
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          currentView === 'table'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        All Applications
      </button>
    </div>
  );
};
