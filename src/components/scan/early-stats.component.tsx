import { StatTile } from '@/components/aeo/stat-tile.component';
import type { IScanStatus } from '@/types/interfaces/scan.interface';

/** Three numbers available before the score: routes, site health, blocked bots. */
export function EarlyStats({ early }: { early: IScanStatus['early'] }) {
  const dash = (v: number | null) => (v === null ? '—' : v);
  return (
    <section aria-labelledby="early-h" className="grid grid-cols-3 gap-3">
      <h2 id="early-h" className="sr-only">
        Early numbers
      </h2>
      <StatTile value={dash(early.routesCrawled)} label="routes crawled" />
      <StatTile value={dash(early.siteHealth)} suffix={early.siteHealth === null ? undefined : '/25'} label="site health" />
      <StatTile value={dash(early.botsBlocked)} label="bots blocked" danger={!!early.botsBlocked} />
    </section>
  );
}
