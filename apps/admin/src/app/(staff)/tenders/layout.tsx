import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tender Management' };

export default function TendersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
