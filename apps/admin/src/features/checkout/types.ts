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

export type DeliveryOption = 'standard' | 'express' | 'scheduled';

export type PaymentMethod = 'card' | 'ach' | 'credit-terms';

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
