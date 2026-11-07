import 'server-only';

import { FIX_DRAFT_SYSTEM, buildFixDraftPrompt } from '@/lib/ai/prompts/fix-draft.prompt';
import { callStructured } from '@/lib/ai/structured.util';
import { getEnv } from '@/lib/env';
import { fixDraftSchema } from '@/schema/fix-draft.schema';
import type { TFixType } from '@/types/enums/fix.enum';

import { type IDraftFact, enforceConfirmTokens, valueOrToken, wordCount } from './confirm-token.util';

const MARKETING = /\b(powerful|seamless(ly)?|robust|innovative|best-in-class|world-class|cutting-edge|revolutionary|effortless(ly)?|game-chang\w*)\b/i;

export interface IDraftInput {
  type: TFixType;
  brand: string;
  route: string;
  placement: string | null;
  gap: string;
  focus: string | null;
  facts: IDraftFact[];
  ratings: { platform: string; value: number; count: number | null }[];
  variant: number;
}

export interface IDraftResult {
  heading: string;
  body: string;
  /** "## heading\n\nbody", what gets stored in fixes.draft_copy. */
  copy: string;
  wordCount: number;
  unconfirmedKeys: string[];
  notes: string[];
  usedFallback: boolean;
}

/** Template copy used when Gemini is not configured or fails. */
function fallbackDraft(i: IDraftInput): { heading: string; body: string } {
  const v = (k: string) => valueOrToken(i.facts, k);
  switch (i.type) {
    case 'definitional_paragraph':
      return {
        heading: `What is ${i.brand}?`,
        body: `${i.brand} is ${v('category').toLowerCase()} for ${v('target_customer')}. ${v('one_line_description')}. It runs on ${v('platforms')}. Free plan: ${v('free_tier')}. The ${v('paid_tier_name')} plan costs ${v('paid_tier_price')}.`,
      };
    case 'feature_summary': {
      const f = i.facts.find(x => x.label === i.focus || x.key === i.focus);
      const name = f?.label ?? i.focus ?? 'Features';
      return {
        heading: name,
        body: `Yes. ${i.brand} supports ${name.toLowerCase()}. ${f?.confirmed && f.value ? f.value : valueOrToken(i.facts, f?.key ?? 'feature_1')}. It is available on ${v('platforms')}.`,
      };
    }
    case 'rating_fix':
      return {
        heading: 'Ratings and reviews',
        body: i.ratings.length
          ? i.ratings.map(r => `${r.value} out of 5 on ${r.platform}${r.count ? ` from ${r.count} reviews` : ''}.`).join(' ')
          : `[confirm: rating] out of 5 on [confirm: platform].`,
      };
    default:
      return { heading: i.brand, body: v('one_line_description') };
  }
}

function notesFor(body: string, tokens: number): string[] {
  return [
    'Every fact from your fact sheet',
    ...(MARKETING.test(body) ? [] : ['No marketing adjectives']),
    tokens ? `${tokens} blank${tokens === 1 ? '' : 's'} to confirm` : 'Nothing to confirm',
  ];
}

export async function draftCopy(input: IDraftInput): Promise<IDraftResult> {
  let draft: { heading: string; body: string };
  let usedFallback = false;
  if (getEnv().GEMINI_API_KEY) {
    try {
      draft = await callStructured(fixDraftSchema, buildFixDraftPrompt(input), {
        system: FIX_DRAFT_SYSTEM,
        temperature: input.variant ? 0.7 : 0.3,
      });
    } catch (error) {
      console.warn('[fix draft] falling back to template', error);
      draft = fallbackDraft(input);
      usedFallback = true;
    }
  } else {
    draft = fallbackDraft(input);
    usedFallback = true;
  }

  const heading = enforceConfirmTokens(draft.heading.trim().replace(/^#+\s*/, ''), input.facts);
  const body = enforceConfirmTokens(draft.body.trim(), input.facts);
  return {
    heading: heading.text,
    body: body.text,
    copy: `## ${heading.text}\n\n${body.text}`,
    wordCount: wordCount(body.text),
    unconfirmedKeys: [...new Set([...heading.unconfirmedKeys, ...body.unconfirmedKeys])],
    notes: notesFor(body.text, heading.tokenCount + body.tokenCount),
    usedFallback,
  };
}
