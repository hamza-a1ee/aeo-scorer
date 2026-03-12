// React
import { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface ISearchInput extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

const SearchInput = ({
  label,
  name,
  className,
  error,
  touched,
  required,
  ...props
}: ISearchInput) => {
  const isError = error && touched;

  return (
    <label htmlFor={name} className="space-y-2 flex flex-col w-full">
      {label && (
        <p className="text-[#212636] text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
      )}
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#828282]"
          size={18}
        />
        <input
          id={name}
          name={name}
          type="text"
          className={cn(
            'w-full h-11 pl-10 pr-3 rounded-lg border border-gray-300 shadow-sm text-gray-900 placeholder:text-[#828282] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            isError && 'border-red-500! focus:ring-red-500',
            className,
          )}
          {...props}
        />
      </div>
      {isError && <p className="text-red-500 text-xs">{error}</p>}
    </label>
  );
};

export default SearchInput;
