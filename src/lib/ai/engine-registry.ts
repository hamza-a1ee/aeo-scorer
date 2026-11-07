import 'server-only';

import type { TEngine } from '@/types/enums/answer.enum';

import type { IAnswerEngine } from './answer-engine.interface';
import { geminiEngine } from './engines/gemini.engine';
import { openaiEngine } from './engines/openai.engine';
import { perplexityEngine } from './engines/perplexity.engine';

const ALL: IAnswerEngine[] = [geminiEngine, openaiEngine, perplexityEngine];

/** Engines with an API key, in report order. */
export function getConfiguredEngines(): IAnswerEngine[] {
  return ALL.filter(e => e.isConfigured());
}

export function getEngines(ids: TEngine[]): IAnswerEngine[] {
  return ALL.filter(e => ids.includes(e.id) && e.isConfigured());
}
