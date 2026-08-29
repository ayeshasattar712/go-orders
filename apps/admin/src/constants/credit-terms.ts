export const CREDIT_TERMS = {
  COD: 'cod',
  PREPAID: 'prepaid',
  NET_15: 'net-15',
  NET_30: 'net-30',
  NET_45: 'net-45',
  NET_60: 'net-60',
} as const;

export type CreditTerms = (typeof CREDIT_TERMS)[keyof typeof CREDIT_TERMS];

export const CREDIT_TERM_OPTIONS: { value: CreditTerms; label: string; days: number | null }[] = [
  { value: CREDIT_TERMS.COD, label: 'Cash on delivery', days: 0 },
  { value: CREDIT_TERMS.PREPAID, label: 'Prepaid / in advance', days: 0 },
  { value: CREDIT_TERMS.NET_15, label: 'Net-15', days: 15 },
  { value: CREDIT_TERMS.NET_30, label: 'Net-30', days: 30 },
  { value: CREDIT_TERMS.NET_45, label: 'Net-45', days: 45 },
  { value: CREDIT_TERMS.NET_60, label: 'Net-60', days: 60 },
];

export function creditTermsLabel(terms?: CreditTerms | null): string {
  if (!terms) return 'Net-30';
  return CREDIT_TERM_OPTIONS.find((option) => option.value === terms)?.label ?? terms;
}
