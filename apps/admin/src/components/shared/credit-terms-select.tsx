'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CREDIT_TERM_OPTIONS, type CreditTerms } from '@/constants/credit-terms';

export function CreditTermsSelect({
  value,
  onChange,
  id,
}: {
  value: CreditTerms;
  onChange: (value: CreditTerms) => void;
  id?: string;
}) {
  return (
    <Select value={value ?? 'net-30'} onValueChange={(next) => onChange(next as CreditTerms)}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CREDIT_TERM_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
