'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function safeNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export interface TablePaginationProps {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function TablePagination({
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationProps) {
  const total = safeNum(totalCount, 0);
  const size = safeNum(pageSize, 10);
  const index = safeNum(pageIndex, 0);

  const totalPages = size > 0 ? Math.max(0, Math.ceil(total / size)) : 0;
  const currentPage = totalPages > 0 ? Math.min(index, totalPages - 1) : 0;

  const startItem = total === 0 ? 0 : currentPage * size + 1;
  const endItem = total === 0 ? 0 : Math.min((currentPage + 1) * size, total);

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1 && totalPages > 0;

  const rangeText =
    total === 0 ? '0-0 of 0' : `${startItem}-${endItem} of ${total}`;

  const handlePrev = () => {
    if (canPrev) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (canNext) onPageChange(currentPage + 1);
  };

  const handleSizeChange = (value: string) => {
    const next = safeNum(Number(value), 10);
    if (next > 0) onPageSizeChange(next);
  };

  const sizeValue = String(size);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 text-sm text-foreground',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">per page:</span>
        <Select
          value={sizeValue}
          onValueChange={handleSizeChange}
          disabled={total === 0}
        >
          <SelectTrigger
            size="sm"
            className="h-8 w-17.5 border-border bg-background text-foreground"
          >
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            {(pageSizeOptions.length ? pageSizeOptions : PAGE_SIZE_OPTIONS).map(
              opt => {
                const val = safeNum(opt, 10);
                if (val <= 0) return null;
                return (
                  <SelectItem key={val} value={String(val)}>
                    {val}
                  </SelectItem>
                );
              },
            )}
          </SelectContent>
        </Select>
      </div>

      <span className="text-muted-foreground">{rangeText}</span>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={handlePrev}
          disabled={!canPrev}
          aria-label="Previous page"
          className="border-border text-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={handleNext}
          disabled={!canNext}
          aria-label="Next page"
          className="border-border text-foreground hover:bg-muted disabled:opacity-50"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
