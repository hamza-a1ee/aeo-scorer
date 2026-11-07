'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { TooltipProvider } from '@/components/ui/tooltip';

import ReactQueryProvider from './react-query-provider';
import { ToasterProvider } from './toaster-provider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ToasterProvider />
      <TooltipProvider delayDuration={200}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipProvider>
    </ReactQueryProvider>
  );
};
