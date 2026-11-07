/**
 * Unconfirmed facts never appear as values in drafted copy or code.
 * They appear as a literal "[confirm: <label>]" token the user fills in.
 */
export const confirmToken = (label: string) => `[confirm: ${label.toLowerCase()}]`;

const TOKEN_RE = /\[confirm:\s*([^\]]+)\]/gi;

export interface IDraftFact {
  key: string;
  label: string;
  value: string | null;
  confirmed: boolean;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replaces leaked unconfirmed values with tokens and reports which keys are referenced. */
export function enforceConfirmTokens(text: string, facts: IDraftFact[]) {
  let out = text;
  const unconfirmed = facts.filter(f => !f.confirmed);
  for (const f of unconfirmed) {
    const v = f.value?.trim();
    if (v && v.length >= 3) out = out.replace(new RegExp(esc(v), 'gi'), confirmToken(f.label));
  }
  // Normalise token spelling, e.g. "[Confirm:Paid tier name]".
  out = out.replace(TOKEN_RE, (_, label: string) => confirmToken(label.trim()));
  const labels = new Set([...out.matchAll(TOKEN_RE)].map(m => m[1].trim().toLowerCase()));
  const unconfirmedKeys = unconfirmed.filter(f => labels.has(f.label.toLowerCase())).map(f => f.key);
  return { text: out, unconfirmedKeys, tokenCount: countTokens(out) };
}

export const countTokens = (text: string | null | undefined) =>
  text ? (text.match(TOKEN_RE) ?? []).length : 0;

/** Word count of copy, tokens count as one word each. */
export function wordCount(text: string): number {
  return text.replace(TOKEN_RE, 'X').split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Fact value, or its confirm token when unconfirmed. */
export function valueOrToken(facts: IDraftFact[], key: string, fallbackLabel?: string): string {
  const f = facts.find(x => x.key === key);
  if (f?.confirmed && f.value) return f.value;
  return confirmToken(f?.label ?? fallbackLabel ?? key.replace(/_/g, ' '));
}
