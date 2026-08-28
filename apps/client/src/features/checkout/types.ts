export interface CheckoutAddress {
  id: string;
  label: string;
  fullName: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export type DeliveryOption = 'hour' | 'standard' | 'express' | 'scheduled';

export type PaymentMethod = 'bank-account' | 'online-transfer';

export function shippingFee(option: DeliveryOption) {
  if (option === 'hour') return 99;
  if (option === 'express') return 49;
  if (option === 'scheduled') return 19;
  return 0;
}

export const savedAddresses: CheckoutAddress[] = [
  {
    id: 'addr_hq',
    label: 'Headquarters',
    fullName: 'Morgan Lee',
    company: 'Cascade Financial Group',
    line1: '4400 Innovation Way, Suite 300',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    isDefault: true,
  },
  {
    id: 'addr_warehouse',
    label: 'Warehouse',
    fullName: 'Receiving Dept.',
    company: 'Cascade Financial Group',
    line1: '12 Distribution Pkwy',
    city: 'Round Rock',
    state: 'TX',
    zip: '78664',
  },
];
