'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ICopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'onClick' | 'value'> {
  value: string | (() => string);
  label?: string;
  copiedLabel?: string;
  toastMessage?: string;
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  toastMessage,
  className,
  variant = 'default',
  ...props
}: ICopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof value === 'function' ? value() : value,
      );
      setCopied(true);
      if (toastMessage) toast.success(toastMessage);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onCopy}
      className={cn('min-h-10', className)}
      {...props}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
