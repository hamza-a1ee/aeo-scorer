import { cn } from '@/lib/utils';
import React, { HTMLAttributes } from 'react';

const headingVariants = {
  default: 'text-[28px] font-bold',
  secondary: 'text-[20px] text-primary-2 font-semibold',
  verificationStepForm:
    'text-[28px] font-bold text-center text-neutral-gray-90',
  quoteRequestUpsert: 'font-semibold text-2xl text-primary-2',
} as const;

type HeadingVariant = keyof typeof headingVariants;

interface Props extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  variant?: HeadingVariant;
}

export default function Heading({
  className,
  children,
  variant = 'default',
  ...props
}: Props) {
  return (
    <h1 className={cn(headingVariants[variant], className)} {...props}>
      {children}
    </h1>
  );
}
