'use client';
// Next.js Core
import { usePathname } from 'next/navigation';

// React
import React, { Suspense, useState } from 'react';

// Components
import MeHeader from '@/components/me-header.component';
import Sidebar from '@/components/sidebar';
import SuspenseLoading from '@/components/suspense-loading.component';

interface Props {
  children: React.ReactNode;
}

export default function MechanicDashboardLayout({ children }: Props) {
  // ===================Hooks==================

  const pathname = usePathname();
  // ===================States==================
  const [open, setOpenChange] = useState<boolean>(false);

  // ===================Handles==================

  const handleClose = () => setOpenChange(false);
  return (
    <Suspense fallback={<SuspenseLoading />}>
      <div className="flex ">
        {/* Sidebar */}
        <Sidebar onOpenChange={handleClose} open={open} pathname={pathname} />
        <div className="w-full min-h-dvh  md:ml-67.5  p-5 flex flex-col gap-4 bg-mechanic-bg!">
          {' '}
          <MeHeader />
          {children}
        </div>
      </div>
    </Suspense>
  );
}
