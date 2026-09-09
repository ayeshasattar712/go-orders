'use client';

import { useMemo, useState } from 'react';
import { SortBySelect, sortProducts, type SortOption } from '@/features/catalog/components/product-toolbar';
import type { Product } from '@/types/catalog';

export function useCatalogSection(products: Product[]) {
  const [sort, setSort] = useState<SortOption>('relevance');
  const visible = useMemo(() => sortProducts(products, sort), [products, sort]);
  return { sort, setSort, visible };
}

export function CatalogSectionControls({
  sort,
  onSortChange,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}) {
  return <SortBySelect sort={sort} onSortChange={onSortChange} />;
}
