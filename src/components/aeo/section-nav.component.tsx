'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ISectionNavProps {
  items: { id: string; label: string }[];
  label?: string;
}

/** Pill navigation that highlights the section in view. */
export function SectionNav({ items, label = 'Report sections' }: ISectionNavProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    items.forEach(i => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {items.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? 'true' : undefined}
          className={cn(
            'rounded-full border border-border bg-card px-3 py-2 text-[13px] text-body no-underline transition-colors hover:bg-subtle',
            active === item.id && 'border-primary bg-primary text-primary-foreground hover:bg-primary',
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
