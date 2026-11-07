import 'server-only';

import type { TFactRow, TScanRow } from '@/lib/supabase/rows.type';

/** Names an engine might use for the brand: brand name, product name, domain root. */
export function brandAliases(scan: TScanRow, facts: TFactRow[] = []): string[] {
  const product = facts.find(f => f.key === 'product_name')?.value;
  const root = scan.domain.split('.')[0];
  const set = new Set(
    [scan.brand_name, product, root]
      .filter((v): v is string => !!v && v.trim().length > 1)
      .map(v => v.trim()),
  );
  return [...set];
}

export function mentionsBrand(text: string, aliases: string[]): boolean {
  const lower = text.toLowerCase();
  return aliases.some(a => {
    const esc = a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, 'i').test(lower);
  });
}

export function brandLabel(scan: TScanRow): string {
  return scan.brand_name ?? scan.domain;
}
