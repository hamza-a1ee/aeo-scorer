// Next.js Core
import Image from 'next/image';
import Link from 'next/link';

// Server Actions

// Assets
import Logo from '@/../public/assets/some-logo.png';

import { cn } from '@/lib/utils';

import { X } from 'lucide-react';

import { SidebarItems } from '@/constants/sidebar-items.constant';
import GetVerifiedBadgeCard from './get-verified-badge-card.component';
import { TVoidCallback } from '@/types/types/common/common.type';

interface Props {
  open: boolean;
  onOpenChange: TVoidCallback;
  pathname: string;
}
export default function Sidebar({ onOpenChange, pathname }: Props) {
  return (
    <div className="w-67.5  fixed h-dvh bg-sidebar-bg  hidden md:flex flex-col justify-between overflow-y-auto">
      {/* Logo */}
      <div className="flex flex-col pt-1">
        <div className="flex items-center justify-center p-6 relative">
          <button
            onClick={onOpenChange}
            type="button"
            className="absolute  hover:bg-white/10 rounded-full sm:hidden block p-1 top-3 right-2 "
          >
            <X className="text-white size-5  " />
          </button>
          <div className="flex w-full flex-start border-b border-neutral-gray-0 pb-4">
            <Image src={Logo} width={113} height={44} alt="Logo" priority />
          </div>
        </div>
        {/* Items */}

        <div className="w-full flex flex-col items-center gap-2 px-6">
          {SidebarItems.map(item => (
            <Link
              key={item.label}
              href={item.href()}
              type="button"
              title={item.label}
              className={cn(
                'rounded-lg w-full h-[41px] text-base duration-200 ease-in-out  text-white hover:bg-primary py-1  px-3 flex!  justify-start items-center gap-3 truncate line-clamp-1',
                pathname === item.href() &&
                  'bg-primary font-semibold text-white  ',
              )}
            >
              <span className="mb-1">{item?.logo?.[0]}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <GetVerifiedBadgeCard />
    </div>
  );
}
