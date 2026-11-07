import type { TFactGroup } from '@/types/enums/fact.enum';

export interface IFactCatalogEntry {
  key: string;
  group: TFactGroup;
  label: string;
  /** Feature facts get their label (the feature's name) from the site. */
  dynamicLabel?: boolean;
  hint: string;
}

/** The 23 facts every fact sheet tries to fill, in display order. */
export const FACT_CATALOG: IFactCatalogEntry[] = [
  { key: 'product_name', group: 'basics', label: 'App name', hint: 'The product name exactly as the site writes it.' },
  { key: 'one_line_description', group: 'basics', label: 'One-line description', hint: 'What the product is and who it is for, in one plain sentence.' },
  { key: 'category', group: 'basics', label: 'Category', hint: 'The software category a buyer would search for, e.g. "Invoicing software".' },
  { key: 'platforms', group: 'basics', label: 'Platforms', hint: 'Web, iOS, Android, macOS, Windows, Linux, API, etc.' },
  { key: 'target_customer', group: 'basics', label: 'Target customer', hint: 'Who the product is built for.' },
  { key: 'company_name', group: 'basics', label: 'Company', hint: 'Legal or trading name of the company behind the product.' },
  { key: 'founded_year', group: 'basics', label: 'Founded', hint: 'Year the company or product launched.' },
  { key: 'headquarters', group: 'basics', label: 'Headquarters', hint: 'City and country.' },
  { key: 'free_tier', group: 'pricing', label: 'Free tier', hint: 'Whether a free plan exists and its main limit.' },
  { key: 'paid_tier_price', group: 'pricing', label: 'Paid tier', hint: 'Entry paid price with period and billing, e.g. "$12 per month, billed annually".' },
  { key: 'paid_tier_name', group: 'pricing', label: 'Paid tier name', hint: 'Name of the entry paid plan.' },
  { key: 'billing_options', group: 'pricing', label: 'Billing options', hint: 'Monthly vs annual prices if both are listed.' },
  { key: 'free_trial', group: 'pricing', label: 'Free trial', hint: 'Trial length, if any.' },
  { key: 'enterprise_plan', group: 'pricing', label: 'Enterprise plan', hint: 'Whether a custom or enterprise plan exists.' },
  { key: 'currency', group: 'pricing', label: 'Currency', hint: 'Currency the prices are shown in.' },
  { key: 'feature_1', group: 'features', label: 'Key feature 1', dynamicLabel: true, hint: 'Most prominent feature: label = feature name, value = what it does.' },
  { key: 'feature_2', group: 'features', label: 'Key feature 2', dynamicLabel: true, hint: 'Second feature.' },
  { key: 'feature_3', group: 'features', label: 'Key feature 3', dynamicLabel: true, hint: 'Third feature.' },
  { key: 'feature_4', group: 'features', label: 'Key feature 4', dynamicLabel: true, hint: 'Fourth feature.' },
  { key: 'feature_5', group: 'features', label: 'Key feature 5', dynamicLabel: true, hint: 'Fifth feature.' },
  { key: 'feature_6', group: 'features', label: 'Key feature 6', dynamicLabel: true, hint: 'Sixth feature.' },
  { key: 'integrations', group: 'features', label: 'Integrations', hint: 'Named integrations or payment providers.' },
  { key: 'security_compliance', group: 'features', label: 'Security & compliance', hint: 'SOC 2, GDPR, SSO, etc.' },
];

export const FACT_KEYS = FACT_CATALOG.map(f => f.key) as [string, ...string[]];

export const FACT_BY_KEY = Object.fromEntries(
  FACT_CATALOG.map(f => [f.key, f]),
) as Record<string, IFactCatalogEntry>;

export const FACT_GROUP_TITLES: Record<TFactGroup, string> = {
  basics: 'Basics',
  pricing: 'Pricing',
  features: 'Key features',
};
