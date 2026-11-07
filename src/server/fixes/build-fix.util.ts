import 'server-only';

import { FIX_TYPE_META } from '@/constants/fix-types.constant';
import { RATING_LABELS } from '@/constants/ratings.constant';
import type { TFixRow } from '@/lib/supabase/rows.type';
import type { IScanData } from '@/server/scoring/score-input.util';
import type { TFixType } from '@/types/enums/fix.enum';
import type { TRatingPlatform } from '@/types/enums/fact.enum';

import { type IDraftFact, countTokens, enforceConfirmTokens, wordCount } from './confirm-token.util';
import { draftCopy } from './draft-fix.util';
import { buildLlmsTxt } from './templates/llms-txt.template';
import { buildDateModifiedJsonLd, buildSoftwareJsonLd } from './templates/jsonld.template';
import { buildRobotsPatch } from './templates/robots-patch.template';
import { brandLabel } from '@/server/judge/brand.util';

export interface IFixSpec {
  type: TFixType;
  route: string;
  title: string;
  why: string;
  gap: string;
  gapQuestionId: number | null;
  focus: string | null;
}

type TFixContent = Pick<
  TFixRow,
  'draft_copy' | 'draft_word_count' | 'notes' | 'code_block' | 'code_lang' | 'unconfirmed_keys'
>;

const DIRECTORY_URLS: Record<string, string> = {
  g2: 'https://sell.g2.com',
  capterra: 'https://vendors.capterra.com',
  trustpilot: 'https://business.trustpilot.com',
  app_store: 'https://appstoreconnect.apple.com',
  google_play: 'https://play.google.com/console',
};

export function draftFacts(data: IScanData): IDraftFact[] {
  return data.facts.map(f => ({ key: f.key, label: f.label, value: f.value, confirmed: f.confirmed }));
}

function realRatings(data: IScanData) {
  return data.ratings
    .filter(r => r.value !== null)
    .map(r => ({ platform: RATING_LABELS[r.platform as TRatingPlatform] ?? r.platform, value: Number(r.value), count: r.count }));
}

function bestRating(data: IScanData) {
  const r = data.ratings.filter(x => x.value !== null).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
  return r ? { value: Number(r.value), count: r.count } : null;
}

/** Copy and/or code for one fix. `variant` > 0 for Regenerate. */
export async function buildFixContent(spec: IFixSpec, data: IScanData, variant = 0): Promise<TFixContent> {
  const facts = draftFacts(data);
  const brand = brandLabel(data.scan);
  const meta = FIX_TYPE_META[spec.type];
  const code = (text: string, lang: string) => {
    const guarded = enforceConfirmTokens(text, facts);
    return { code_block: guarded.text, code_lang: lang, keys: guarded.unconfirmedKeys, tokens: guarded.tokenCount };
  };

  switch (spec.type) {
    case 'robots_patch': {
      const blocked = Object.entries(data.site?.site_bot_access ?? {}).filter(([, v]) => v === 'blocked').map(([k]) => k);
      return {
        draft_copy: null,
        draft_word_count: null,
        notes: ['Replace the file at your site root', `Allows ${blocked.join(', ')}`, 'Keeps your other rules as they are'],
        code_block: buildRobotsPatch(data.site?.robots_txt ?? null, blocked),
        code_lang: 'text',
        unconfirmed_keys: [],
      };
    }
    case 'llms_txt': {
      const c = code(
        buildLlmsTxt({
          brand,
          origin: data.scan.origin,
          facts,
          pages: data.pages.filter(p => !p.fetch_error).map(p => ({ route: p.route, title: p.title, pageType: p.page_type })),
        }),
        'markdown',
      );
      return {
        draft_copy: null,
        draft_word_count: null,
        notes: ['Save as /llms.txt at the site root', 'Facts come from your fact sheet', c.tokens ? `${c.tokens} blanks to confirm` : 'Nothing to confirm'],
        code_block: c.code_block,
        code_lang: c.code_lang,
        unconfirmed_keys: c.keys,
      };
    }
    case 'product_jsonld': {
      const c = code(buildSoftwareJsonLd({ brand, facts, rating: bestRating(data) }), 'json');
      return {
        draft_copy: null,
        draft_word_count: null,
        notes: ['Paste inside <head>', 'Prices match your fact sheet', c.tokens ? `${c.tokens} blanks to confirm` : 'Nothing to confirm'],
        code_block: c.code_block,
        code_lang: c.code_lang,
        unconfirmed_keys: c.keys,
      };
    }
    case 'freshness_note': {
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      const human = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const copy = `## Last updated\n\nLast updated ${human}.`;
      return {
        draft_copy: copy,
        draft_word_count: wordCount(`Last updated ${human}.`),
        notes: ['Update the date whenever the page changes', 'Keep the visible date and dateModified in sync'],
        code_block: buildDateModifiedJsonLd(`${data.scan.origin.replace(/\/$/, '')}${spec.route}`, iso),
        code_lang: 'json',
        unconfirmed_keys: [],
      };
    }
    case 'directory_checklist': {
      const missing = (['g2', 'capterra', 'trustpilot'] as TRatingPlatform[]).filter(
        p => !data.ratings.some(r => r.platform === p && r.value !== null),
      );
      const roundups = [...new Set(data.judgments.flatMap(j => j.review_sources))].slice(0, 5);
      const lines = [
        ...missing.map(p => `- Claim or create your ${RATING_LABELS[p]} listing: ${DIRECTORY_URLS[p]}`),
        '- Use the same one-line description on every listing as on your home page.',
        '- Ask 10 recent customers for a review on the listing you create first.',
        ...roundups.map(r => `- Pitch an update to ${r}, which engines cite for your category.`),
      ];
      const body = lines.join('\n');
      return {
        draft_copy: `## Directory checklist\n\n${body}`,
        draft_word_count: wordCount(body),
        notes: [`${missing.length} listing${missing.length === 1 ? '' : 's'} to create`, 'Takes days, not minutes'],
        code_block: null,
        code_lang: null,
        unconfirmed_keys: [],
      };
    }
    default: {
      const draft = await draftCopy({
        type: spec.type,
        brand,
        route: spec.route,
        placement: meta.placement,
        gap: spec.gap,
        focus: spec.focus,
        facts,
        ratings: realRatings(data),
        variant,
      });
      const withJsonLd = spec.type === 'definitional_paragraph' ? code(buildSoftwareJsonLd({ brand, facts, rating: bestRating(data) }), 'json') : null;
      return {
        draft_copy: draft.copy,
        draft_word_count: draft.wordCount,
        notes: draft.notes,
        code_block: withJsonLd?.code_block ?? null,
        code_lang: withJsonLd?.code_lang ?? null,
        unconfirmed_keys: [...new Set([...draft.unconfirmedKeys, ...(withJsonLd?.keys ?? [])])],
      };
    }
  }
}

export const fixTokenCount = (row: Pick<TFixRow, 'draft_copy' | 'code_block'>) =>
  countTokens(row.draft_copy) + countTokens(row.code_block);
