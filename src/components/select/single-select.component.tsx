// React
import React, { Activity, JSX } from 'react';

// Components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

import { TVoidCallback } from '@/types/types/common/common.type';
import { ISelect } from '@/types/interfaces/single-select.interface';

interface Props extends ISelect {
  searchFn?: TVoidCallback<[string]>;
  icon?: JSX.Element;
}

export function SingleSelect({
  items,
  className,
  placeholder,
  value,
  triggerClassName,
  trigger,
  onChange,
  searchFn,
  selectItemClassName,
  disabled,
  icon,
}: Props) {
  return (
    <Select onValueChange={onChange} value={value}>
      {React.isValidElement(trigger) ? (
        trigger
      ) : (
        <SelectTrigger
          disabled={disabled}
          className={cn(
            'w-full min-h-14 max-w-full overflow-hidden border border-neutral-gray-10',
            triggerClassName,
          )}
        >
          <div className="flex text-start justify-between w-full max-w-full overflow-hidden [&_span]:truncate">
            <Activity mode={icon ? 'visible' : 'hidden'}>{icon}</Activity>
            <SelectValue
              className={cn('w-full ', placeholder && 'text-neutral-gray-50')}
              placeholder={placeholder ?? 'Select'}
            />
            <div />
          </div>
        </SelectTrigger>
      )}
      <SelectContent
        side="bottom"
        sideOffset={6}
        position="popper"
        className={cn(
          'select-dropdown-scroll bg-white rounded-md shadow-lg border-2 text-gray-500 hover:text-gray-500 min-w-[--radix-select-trigger-width] max-w-[80vw] sm:max-w-full',
          className,
        )}
      >
        <SelectGroup>
          {searchFn ? (
            <div className="p-2">
              <Input
                onChange={e => searchFn(e.target.value)}
                placeholder="Search..."
                className="w-full"
              />
            </div>
          ) : null}

          {items?.map((item, index) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className={cn(
                'min-h-[37px] border-b border-neutral-gray-10 px-3 pr-8 text-sm font-normal text-test-secondary whitespace-nowrap capitalize transition-colors duration-200 [&_[data-slot=select-item-indicator]_svg]:text-inherit',
                index === items.length - 1 && 'border-b-0',
                selectItemClassName,
              )}
            >
              <span
                translate="no"
                className="block min-w-0 truncate"
                title={typeof item.label === 'string' ? item.label : undefined}
              >
                {item.label}
              </span>
            </SelectItem>
          ))}

          {items?.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No results found
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
