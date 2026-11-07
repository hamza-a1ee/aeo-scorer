import { type IDraftFact, confirmToken, valueOrToken } from '../confirm-token.util';

const CURRENCY: Record<string, string> = { $: 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR' };

function firstPrice(text: string | null): string | null {
  const m = text?.match(/(\d+(?:[.,]\d{1,2})?)/);
  return m ? m[1].replace(',', '.') : null;
}

function currencyCode(facts: IDraftFact[]): string {
  const cur = facts.find(f => f.key === 'currency');
  const price = facts.find(f => f.key === 'paid_tier_price');
  const raw = `${cur?.confirmed ? cur.value ?? '' : ''} ${price?.confirmed ? price.value ?? '' : ''}`;
  const iso = raw.match(/\b(USD|EUR|GBP|CAD|AUD|INR|JPY|PKR)\b/i)?.[1];
  if (iso) return iso.toUpperCase();
  const sym = Object.keys(CURRENCY).find(s => raw.includes(s));
  return sym ? CURRENCY[sym] : confirmToken('currency');
}

interface IJsonLdInput {
  brand: string;
  facts: IDraftFact[];
  rating?: { value: number; count: number | null } | null;
}

/** SoftwareApplication + Offer JSON-LD, wrapped in its script tag. */
export function buildSoftwareJsonLd({ brand, facts, rating }: IJsonLdInput): string {
  const fact = (k: string) => facts.find(f => f.key === k);
  const freeTier = fact('free_tier');
  const hasFree = !!freeTier?.confirmed && !!freeTier.value && !/\bno\b|none|not/i.test(freeTier.value);
  const paid = fact('paid_tier_price');
  const paidPrice = paid?.confirmed ? firstPrice(paid.value) : null;
  const currency = currencyCode(facts);

  const offers: Record<string, string>[] = [];
  if (hasFree) offers.push({ '@type': 'Offer', price: '0', priceCurrency: currency });
  offers.push({
    '@type': 'Offer',
    name: valueOrToken(facts, 'paid_tier_name'),
    price: paidPrice ?? confirmToken(paid?.label ?? 'paid tier'),
    priceCurrency: currency,
  });

  const doc: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: fact('product_name')?.confirmed ? fact('product_name')!.value : brand,
    applicationCategory: 'BusinessApplication',
    operatingSystem: valueOrToken(facts, 'platforms'),
    description: valueOrToken(facts, 'one_line_description'),
    offers,
  };
  if (rating?.value) {
    doc.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(rating.value),
      ...(rating.count ? { reviewCount: String(rating.count) } : {}),
    };
  }
  return `<script type="application/ld+json">\n${JSON.stringify(doc, null, 2)}\n</script>`;
}

/** WebPage JSON-LD carrying dateModified, for the freshness fix. */
export function buildDateModifiedJsonLd(url: string, isoDate: string): string {
  const doc = { '@context': 'https://schema.org', '@type': 'WebPage', url, dateModified: isoDate };
  return `<script type="application/ld+json">\n${JSON.stringify(doc, null, 2)}\n</script>`;
}
