'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { ISelectItems } from '@/types/interfaces/single-select.interface';

interface Props {
  items: ISelectItems[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function MultiSelect({
  items,
  value = [],
  onChange,
  placeholder = 'Select',
  triggerClassName,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleToggle = (itemValue: string) => {
    const newValue = value.includes(itemValue)
      ? value.filter(v => v !== itemValue)
      : [...value, itemValue];
    onChange(newValue);
  };

  const displayLabel =
    value.length > 0
      ? value
          .map(
            v => items.find(i => i.value === v)?.label ?? v,
          )
          .join(', ')
      : null;

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
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
          <span
            className={cn(
              'truncate text-start',
              !displayLabel && 'text-neutral-gray-50',
            )}
          >
            {displayLabel ?? placeholder}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-neutral-gray-50 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={6}
        align="start"
        className={cn(
          'p-0 bg-white rounded-md shadow-lg border-2 text-gray-500 w-(--radix-popover-trigger-width) max-w-[80vw] sm:max-w-full',
        )}
      >
        <div className="max-h-60 overflow-y-auto">
          {items.map((item, index) => {
            const isSelected = value.includes(item.value);
            return (
              <div
                key={item.value}
                onClick={() => handleToggle(item.value)}
                className={cn(
                  'w-full flex items-center gap-3 min-h-[37px] border-b border-neutral-gray-10 px-3 text-sm font-normal text-test-secondary transition-colors duration-200 cursor-pointer',
                  'hover:bg-neutral-gray-5',
                  isSelected && 'bg-neutral-gray-5',
                  index === items.length - 1 && 'border-b-0',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-none"
                />
                <span className="block min-w-0 truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
