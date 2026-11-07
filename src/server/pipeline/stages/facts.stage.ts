import 'server-only';

import { FACT_BY_KEY, FACT_CATALOG } from '@/constants/fact-catalog.constant';
import { buildFactExtractionPrompt, FACT_EXTRACTION_SYSTEM } from '@/lib/ai/prompts/fact-extraction.prompt';
import { callStructured } from '@/lib/ai/structured.util';
import type { TFactRow, TPageRow } from '@/lib/supabase/rows.type';
import { factSheetExtractionSchema } from '@/schema/fact-sheet-extraction.schema';
import { addCompetitors, listFacts, listRatings, upsertFacts, upsertRatings } from '@/server/repositories/fact-sheet.repo';
import { listPages } from '@/server/repositories/page.repo';
import { updateScan } from '@/server/repositories/scan.repo';
import type { TPageType } from '@/types/enums/scan.enum';

import type { IPipelineStage } from '../pipeline-context.type';

const TYPE_ORDER: TPageType[] = ['home', 'pricing', 'features', 'product', 'compare', 'about', 'faq', 'integrations', 'security', 'docs'];
const MAX_FACT_PAGES = 9;
const CHARS_PER_PAGE = 6000;

export function normalizeForMatch(s: string) {
  return s
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Picks up to 9 pages: one per important type, then the wordiest. */
export function selectFactPages(pages: TPageRow[]): TPageRow[] {
  const usable = pages.filter(p => !p.fetch_error && (p.word_count ?? 0) > 20);
  const picked: TPageRow[] = [];
  for (const type of TYPE_ORDER) {
    const best = usable
      .filter(p => p.page_type === type && !picked.includes(p))
      .sort((a, b) => a.route.length - b.route.length || (b.word_count ?? 0) - (a.word_count ?? 0))[0];
    if (best) picked.push(best);
    if (type === 'features' || type === 'product') {
      const extra = usable.filter(p => p.page_type === type && !picked.includes(p)).sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0))[0];
      if (extra && picked.length < MAX_FACT_PAGES) picked.push(extra);
    }
    if (picked.length >= MAX_FACT_PAGES) break;
  }
  for (const p of usable.filter(p => !picked.includes(p) && p.page_type !== 'blog').sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0))) {
    if (picked.length >= MAX_FACT_PAGES) break;
    picked.push(p);
  }
  return picked;
}

/** Stage 3: fact sheet with a verified source quote per fact. */
export const factsStage: IPipelineStage = {
  key: 'facts',
  async run(ctx) {
    const { scan } = ctx;
    const pages = selectFactPages(await listPages(scan.id));
    if (!pages.length) throw new Error('No readable pages to build a fact sheet from.');

    const extraction = await callStructured(
      factSheetExtractionSchema,
      buildFactExtractionPrompt(
        scan.domain,
        pages.map(p => ({ route: p.route, title: p.title, text: (p.main_text || p.text_content || '').slice(0, CHARS_PER_PAGE) })),
      ),
      { system: FACT_EXTRACTION_SYSTEM, temperature: 0 },
    );
    await ctx.progress({ done: 1, total: 2 });

    const byRoute = new Map(pages.map(p => [p.route, p]));
    const pageText = (route: string) => {
      const p = byRoute.get(route);
      return normalizeForMatch(`${p?.text_content ?? ''} ${p?.main_text ?? ''} ${p?.title ?? ''}`);
    };

    const existing = await listFacts(scan.id);
    const edited = new Set(existing.filter(f => f.edited_by_user).map(f => f.key));
    const extracted = new Map(extraction.facts.map(f => [f.key, f]));

    const rows: Omit<TFactRow, 'id'>[] = FACT_CATALOG.filter(c => !edited.has(c.key)).map((entry, index) => {
      const f = extracted.get(entry.key);
      const value = f?.value.trim() || null;
      const route = f?.source_route.trim() || null;
      const quote = f?.source_quote.trim() || null;
      const quoteVerified = !!(value && route && quote && byRoute.has(route) && pageText(route).includes(normalizeForMatch(quote)));

      let status = f?.status ?? 'missing';
      let note = f?.note.trim() || null;
      if (!value) {
        status = 'missing';
        note ??= `Not stated on the pages we read. Fixes will show [confirm: ${entry.label.toLowerCase()}].`;
      } else if (status === 'ok' && !quoteVerified) {
        status = 'ambiguous';
        note = 'We could not find this quote word for word on the page. Please confirm.';
      }
      return {
        scan_id: scan.id,
        key: entry.key,
        fact_group: entry.group,
        label: entry.dynamicLabel && f?.label.trim() && !/^key feature/i.test(f.label) ? f.label.trim() : FACT_BY_KEY[entry.key].label,
        value,
        status,
        note: status === 'ok' ? null : note,
        confirmed: status === 'ok',
        source_page_id: route ? byRoute.get(route)?.id ?? null : null,
        source_route: route,
        source_quote: quote,
        quote_verified: quoteVerified,
        sort_order: index,
        edited_by_user: false,
      };
    });
    await upsertFacts(rows);

    await addCompetitors(
      scan.id,
      extraction.competitors
        .filter(c => c.name.trim() && normalizeForMatch(c.name) !== normalizeForMatch(extraction.brand_name))
        .map(c => ({ name: c.name, origin: 'site' as const, source_route: c.source_route || null, domain: null })),
    );

    const userRated = new Set((await listRatings(scan.id)).filter(r => r.origin === 'user').map(r => r.platform));
    await upsertRatings(
      extraction.ratings
        .filter(r => !userRated.has(r.platform) && r.value > 0 && r.value <= 5)
        .map(r => ({
          scan_id: scan.id,
          platform: r.platform,
          value: r.value,
          count: r.count > 0 ? Math.round(r.count) : null,
          source_url: r.source_route ? `${scan.origin}${r.source_route}` : null,
          origin: 'site' as const,
          confirmed: true,
        })),
    );

    await updateScan(scan.id, {
      brand_name: extraction.brand_name.trim() || scan.domain,
      facts_ready_at: new Date().toISOString(),
    });
    await ctx.progress({ done: 2, total: 2 });
  },
};
