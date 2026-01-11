import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'kanban' | 'table';
  onViewChange: (view: 'kanban' | 'table') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center p-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#050A30]',
          currentView === 'kanban'
            ? 'bg-primary text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        )}
      >
        Grouped by Stage
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#050A30]',
          currentView === 'table'
            ? 'bg-primary text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        )}
      >
        All Applications
      </button>
    </div>
  );
};
