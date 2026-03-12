'use client';

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ImageWithFallbackProps = ComponentProps<typeof Image> & {
  fallbackClassName?: string;
  fallbackIconClassName?: string;
  fallback?: React.ReactNode;
};

export default function ImageWithFallback({
  onError,
  fallbackClassName,
  fallbackIconClassName,
  fallback,
  className,
  ...imageProps
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-neutral-gray-10',
          fallbackClassName,
        )}
      >
        {fallback ?? (
          <ImageOff
            className={cn('size-8 text-neutral-gray-50', fallbackIconClassName)}
            aria-hidden
          />
        )}
      </div>
    );
  }

  return <Image {...imageProps} className={className} onError={handleError} />;
}
