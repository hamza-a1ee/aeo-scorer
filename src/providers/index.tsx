'use client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
// React
import React from 'react';

import ReactQueryProvider from './react-query-provider';
import { ToasterProvider } from './toaster-provider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ToasterProvider />
      <NuqsAdapter>{children}</NuqsAdapter>
    </ReactQueryProvider>
  );
};
