import React, { JSX, useState } from 'react';

import InfiniteScroll from '@/components/infinite-scroll.component';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ISelectItems } from '@/types/interfaces/single-select.interface';
import { TVoidCallback } from '@/types/types/common/common.type';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

interface Props {
  items: ISelectItems[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  selectItemClassName?: string;
  disabled?: boolean;
  icon?: JSX.Element;
  trigger?: React.ReactNode;
  searchFn?: TVoidCallback<[string]>;
  // Infinite scroll
  hasMore: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage?: boolean;
}

export function PaginatedListSelect({
  items,
  value = '',
  onChange,
  placeholder,
  className,
  triggerClassName,
  selectItemClassName,
  disabled,
  icon,
  trigger,
  searchFn,
  hasMore,
  fetchNextPage,
  isFetchingNextPage,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (itemValue: string) => {
    onChange?.(itemValue);
    setOpen(false);
  };

  const selectedLabel = items.find(item => item.value === value);
  const displayLabel =
    selectedLabel &&
    (typeof selectedLabel.label === 'string'
      ? selectedLabel.label
      : selectedLabel.value);

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {React.isValidElement(trigger) ? (
          trigger
        ) : (
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full min-h-14 max-w-full overflow-hidden border border-neutral-gray-10 rounded-md px-3 flex items-center justify-between gap-2 bg-white text-sm transition-colors',
              'hover:border-neutral-gray-20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              disabled && 'opacity-50 cursor-not-allowed',
              triggerClassName,
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              {icon && <span className="shrink-0">{icon}</span>}
              <span
                className={cn(
                  'truncate text-start',
                  !value && 'text-neutral-gray-50',
                )}
              >
                {displayLabel ?? placeholder ?? 'Select'}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-neutral-gray-50 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        sideOffset={6}
        align="start"
        className={cn(
          'p-0 bg-white rounded-md shadow-lg border-2 text-gray-500 w-(--radix-popover-trigger-width) max-w-[80vw] sm:max-w-full',
          className,
        )}
      >
        {searchFn && (
          <div className="p-2 border-b border-neutral-gray-10">
            <Input
              onChange={e => searchFn(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
          </div>
        )}

        <InfiniteScroll
          dataLength={items.length}
          next={fetchNextPage}
          hasMore={hasMore}
          className="max-h-60 overflow-y-auto"
          loader={
            isFetchingNextPage ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-4 animate-spin text-neutral-gray-50" />
              </div>
            ) : null
          }
        >
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-4 animate-spin text-neutral-gray-50" />
            </div>
          ) : items.length === 0 ? (
            <div className="w-full text-center px-3 py-6 text-sm text-gray-400">
              No results found
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = value === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className={cn(
                    'w-full flex items-center justify-between min-h-[37px] border-b border-neutral-gray-10 px-3 text-sm font-normal text-test-secondary capitalize transition-colors duration-200 cursor-pointer',
                    'hover:bg-neutral-gray-5',
                    isSelected && 'bg-neutral-gray-5',
                    index === items.length - 1 && 'border-b-0',
                    selectItemClassName,
                  )}
                >
                  <span
                    translate="no"
                    className="block min-w-0 truncate"
                    title={
                      typeof item.label === 'string' ? item.label : undefined
                    }
                  >
                    {item.label}
                  </span>
                  {isSelected && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </div>
              );
            })
          )}
        </InfiniteScroll>
      </PopoverContent>
    </Popover>
  );
}
