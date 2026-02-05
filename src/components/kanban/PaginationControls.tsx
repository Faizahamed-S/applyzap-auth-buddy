import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationControlsProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0a1445] border border-white/20 rounded-2xl">
      <div className="text-sm text-white/90">
        Showing {startItem} to {endItem} of {totalItems} applications
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="bg-[#0d1a50] border-white/20 text-white hover:bg-electric-blue hover:text-white hover:border-electric-blue disabled:opacity-40 disabled:bg-transparent disabled:border-white/10 disabled:text-white/40"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 p-0 ${
                  currentPage === pageNum 
                    ? 'bg-electric-blue text-white border-electric-blue hover:bg-electric-blue/90' 
                    : 'bg-[#0d1a50] border-white/20 text-white hover:bg-electric-blue hover:border-electric-blue'
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="bg-[#0d1a50] border-white/20 text-white hover:bg-electric-blue hover:text-white hover:border-electric-blue disabled:opacity-40 disabled:bg-transparent disabled:border-white/10 disabled:text-white/40"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
