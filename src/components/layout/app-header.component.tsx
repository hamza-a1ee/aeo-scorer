import Link from 'next/link';

import { APP_ROUTES } from '@/constants/app-routes.constant';

import { PageContainer } from './page-container.component';

interface IAppHeaderProps {
  rightSlot?: React.ReactNode;
}

export function BrandLogo() {
  return (
    <Link
      href={APP_ROUTES.home}
      className="flex items-center gap-2.5 text-foreground no-underline"
    >
      <span className="flex size-7 items-center justify-center rounded-[7px] bg-surface-dark text-sm font-bold text-surface-dark-foreground">
        A
      </span>
      <span className="text-lg font-semibold">AEO App</span>
    </Link>
  );
}

export function AppHeader({ rightSlot }: IAppHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <PageContainer className="flex flex-wrap items-center justify-between gap-4 py-4">
        <BrandLogo />
        {rightSlot}
      </PageContainer>
    </header>
  );
}

export function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-body no-underline hover:text-muted-foreground"
    >
      {children}
    </Link>
  );
}
