import { cn } from '@/lib/utils';
import React from 'react';
import Link, { LinkProps } from 'next/link';

interface Props extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export default function SocialButton({ className, children, ...props }: Props) {
  return (
    <Link
      className={cn(
        'w-full h-14 bg-transparent border border-neutral-gray rounded-lg text-primary-heading font-bold text-sm flex items-center justify-center gap-x-2 transition-colors duration-200',
        'hover:bg-primary/10',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
