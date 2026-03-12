'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Matcher } from 'react-day-picker';

interface DatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disabledDates?: Matcher | Matcher[];
  icon?: React.ReactNode;
}

function toDate(s: string | null): Date | undefined {
  if (!s || !s.trim()) return undefined;
  try {
    const d = parse(s, 'yyyy-MM-dd', new Date());
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

function fromDate(d: Date | undefined): string | null {
  if (!d) return null;
  return format(d, 'yyyy-MM-dd');
}

export function DatePicker({
  disabledDates,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
  icon,
}: DatePickerProps) {
  const date = toDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          className={cn(
            'data-[empty=true]:text-muted-foreground h-12 w-full justify-between text-left font-normal rounded-lg border border-neutral-gray-40 bg-white px-3',
            className,
          )}
        >
          <span className="truncate">
            {date ? format(date, 'PPP') : placeholder}
          </span>
          {icon || <ChevronDownIcon className="size-4 opacity-50 shrink-0" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          disabled={disabledDates}
          mode="single"
          selected={date}
          onSelect={d => onChange(fromDate(d))}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
