import 'server-only';

import { ENGINE_LABELS } from '@/constants/engines.constant';
import type { TAnswerRow, TFixRow, TJudgmentRow, TQuestionRow } from '@/lib/supabase/rows.type';
import { fixTokenCount } from '@/server/fixes/build-fix.util';
import type { TFixType } from '@/types/enums/fix.enum';
import type { IFix, IFixSummary } from '@/types/interfaces/fix.interface';

const CODE_TITLES: Record<TFixType, string | null> = {
  robots_patch: 'Patched robots.txt',
  definitional_paragraph: 'Paste with it: SoftwareApplication JSON-LD',
  product_jsonld: 'SoftwareApplication + Offer JSON-LD',
  llms_txt: 'llms.txt',
  feature_summary: null,
  rating_fix: null,
  freshness_note: 'Paste with it: dateModified JSON-LD',
  directory_checklist: null,
};

export const toFixSummary = (f: TFixRow): IFixSummary => ({
  id: f.id,
  type: f.fix_type,
  rank: f.rank,
  isTop3: f.is_top3,
  title: f.title,
  liftPoints: Number(f.lift_points),
  effort: f.effort,
  route: f.route,
  gap: f.gap_summary ?? '',
  why: f.why ?? '',
  done: f.done,
});

/** Splits "## Heading\n\nbody" into its parts. */
export function splitDraft(copy: string | null): { heading: string | null; body: string | null } {
  if (!copy) return { heading: null, body: null };
  const m = /^##\s*(.+?)\n+([\s\S]*)$/.exec(copy.trim());
  return m ? { heading: m[1].trim(), body: m[2].trim() } : { heading: null, body: copy.trim() };
}

interface IGapLookup {
  questions: TQuestionRow[];
  answers: TAnswerRow[];
  judgments: TJudgmentRow[];
}

export function gapDetail(f: TFixRow, lookup: IGapLookup): string {
  const q = lookup.questions.find(x => x.id === f.gap_question_id);
  if (!q) return f.why ?? f.gap_summary ?? '';
  const answerIds = new Map(lookup.answers.filter(a => a.question_id === q.id).map(a => [a.id, a]));
  const rank = { absent: 0, listed: 1, first: 2 } as const;
  const j = lookup.judgments
    .filter(x => answerIds.has(x.answer_id))
    .sort((a, b) => rank[a.mention_position] - rank[b.mention_position])[0];
  if (!j?.why) return `Asked “${q.text}”. ${f.why ?? ''}`.trim();
  const engine = ENGINE_LABELS[answerIds.get(j.answer_id)!.engine];
  return `Asked “${q.text}”, ${engine}: ${j.why}`;
}

export function toFix(f: TFixRow, lookup: IGapLookup): IFix {
  const { heading, body } = splitDraft(f.draft_copy);
  return {
    ...toFixSummary(f),
    subScores: f.sub_scores,
    placement: f.placement,
    draftCopy: body,
    draftHeading: heading,
    draftWordCount: f.draft_word_count,
    notes: f.notes,
    codeBlock: f.code_block,
    codeLang: f.code_lang,
    codeTitle: f.code_block ? CODE_TITLES[f.fix_type] : null,
    gapDetail: gapDetail(f, lookup),
    unconfirmedCount: fixTokenCount(f),
    regenerations: f.regenerations,
  };
}
