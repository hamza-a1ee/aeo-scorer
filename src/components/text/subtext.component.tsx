import { cn } from '@/lib/utils';
import React, { HTMLAttributes } from 'react';

const subtextVariants = {
  default: 'text-base text-neutral-gray-80',
  secondary: 'text-test-secondary text-sm font-normal',
  verificationStepForm: 'text-base text-center text-neutral-gray-80',
} as const;

type SubtextVariant = keyof typeof subtextVariants;

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  variant?: SubtextVariant;
}

export default function SubText({
  children,
  className,
  variant = 'default',
  ...props
}: Props) {
  return (
    <p className={cn(subtextVariants[variant], className)} {...props}>
      {children}
    </p>
  );
}
