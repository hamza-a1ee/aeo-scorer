/**
 * Sanity checks for scoring model v1.0. Run: pnpm score:fixture
 * Runs with tsx so the @/ alias resolves.
 */
import assert from 'node:assert/strict';

import { computeScore, type IScoreInput } from '@/server/scoring/score.util';

const base: IScoreInput = {
  engines: ['gemini'],
  questions: [
    { id: 1, intent: 'category', weight: 2 },
    { id: 2, intent: 'definition', weight: 1 },
    { id: 3, intent: 'task', weight: 2 },
    { id: 4, intent: 'feature', weight: 1 },
  ],
  judged: [
    { questionId: 1, engine: 'gemini', position: 'absent', sentiment: 'na', ratingsQuoted: [], competitorsMentioned: ['Ledgerly'], mentioned: false },
    { questionId: 2, engine: 'gemini', position: 'first', sentiment: 'positive', ratingsQuoted: [{ platform: 'g2', value: 4.6 }], competitorsMentioned: [], mentioned: true },
    { questionId: 3, engine: 'gemini', position: 'absent', sentiment: 'na', ratingsQuoted: [], competitorsMentioned: ['Ledgerly', 'InvoiceKit'], mentioned: false },
    { questionId: 4, engine: 'gemini', position: 'listed', sentiment: 'neutral', ratingsQuoted: [{ platform: 'app_store', value: 3.9 }], competitorsMentioned: [], mentioned: true },
  ],
  claims: [
    { engine: 'gemini', kind: 'pricing', verdict: 'wrong' },
    { engine: 'gemini', kind: 'feature', verdict: 'correct' },
    { engine: 'gemini', kind: 'platform', verdict: 'correct' },
    { engine: 'gemini', kind: 'other', verdict: 'unverifiable' },
  ],
  realRatings: [{ platform: 'g2', value: 4.6 }, { platform: 'app_store', value: 4.4 }],
  routes: [
    { pageType: 'home', routeScore: 60 },
    { pageType: 'pricing', routeScore: 40 },
    { pageType: 'other', routeScore: 100 },
  ],
  siteScore: 60,
  factsConfirmed: 20,
  factsTotal: 23,
  content: { descriptionOnHome: false, numericPriceOnPricing: true, hasComparePage: true, hasFaq: false },
  brand: 'Tallybook',
  competitors: ['Ledgerly', 'InvoiceKit'],
};

const s = computeScore(base);
console.log(JSON.stringify({ total: s.total, grade: s.grade, visibility: s.visibility, accuracy: s.accuracy, reputation: s.reputation, site_health: s.site_health, content_readiness: s.content_readiness, sov: s.shareOfVoice, ratings: s.ratingChecks }, null, 2));

// Maxima
assert.ok(s.visibility <= 25 && s.accuracy <= 25 && s.reputation <= 10 && s.site_health <= 25 && s.content_readiness <= 15);
assert.ok(s.total >= 0 && s.total <= 100);

// Visibility: category/task count double. (2*0 + 1*1 + 2*0 + 1*0.6) / 6 * 25 = 6.67
assert.equal(s.visibility, 6.67);

// Accuracy: pricing wrong costs double. wrong 2 of (2+2+1)=5 → (1-0.4)*25 = 15
assert.equal(s.accuracy, 15);

// Site health: home and pricing 3x. (3*60+3*40+100)/7 = 57.14 → 20*0.5714 + 5*0.6 = 14.43
assert.equal(s.site_health, 14.43);

// Content: 20/23*6 = 5.22 + 3 + 1.5 = 9.72
assert.equal(s.content_readiness, 9.72);

// Reputation: sentiment (1 + 0.6)/2*6 = 4.8; ratings g2 matches 1, app store wrong 0 → 0.5*4 = 2 → 6.8
assert.equal(s.reputation, 6.8);

// Perfect inputs score 100.
const perfect = computeScore({
  ...base,
  judged: base.judged.map(j => ({ ...j, position: 'first', sentiment: 'positive', mentioned: true, ratingsQuoted: [] })),
  claims: base.claims.map(c => ({ ...c, verdict: 'correct' })),
  routes: base.routes.map(r => ({ ...r, routeScore: 100 })),
  siteScore: 100,
  factsConfirmed: 23,
  content: { descriptionOnHome: true, numericPriceOnPricing: true, hasComparePage: true, hasFaq: true },
});
assert.equal(perfect.total, 98); // ratings with no quotes give 2 of 4
console.log('score fixture: all assertions passed');
