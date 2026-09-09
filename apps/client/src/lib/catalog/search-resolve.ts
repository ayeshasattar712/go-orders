import { categories, categoryChildren, products } from '@/lib/mock-data';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  'office-furniture': ['furniture', 'office furniture'],
  'grocery-pantry': ['grocery', 'groceries', 'food', 'pantry'],
  'office-supplies': ['stationery', 'supplies', 'office supplies'],
  'it-equipment': ['electronics', 'electronic', 'it equipment', 'computers'],
  'cleaning-supplies': ['cleaning', 'cleaner', 'janitorial'],
  'electrical-products': ['electrical', 'electric'],
};

export type SearchSuggestion =
  | { type: 'category'; href: string; label: string; hint: string }
  | { type: 'product'; href: string; label: string; hint: string; image: string };

export function getSearchSuggestions(rawQuery: string, limit = 8): SearchSuggestion[] {
  const query = normalize(rawQuery);
  if (query.length < 2) return [];

  const results: SearchSuggestion[] = [];

  for (const category of categories) {
    const name = normalize(category.name);
    const slug = normalize(category.slug.replace(/-/g, ' '));
    const aliases = CATEGORY_ALIASES[category.slug] ?? [];
    if (
      name.includes(query) ||
      slug.includes(query) ||
      aliases.some((alias) => alias === query || alias.startsWith(query) || (query.length >= 4 && query.startsWith(alias)))
    ) {
      results.push({
        type: 'category',
        href: `/categories/${category.slug}`,
        label: category.name,
        hint: 'Category',
      });
    }
  }

  for (const [parentSlug, children] of Object.entries(categoryChildren)) {
    const parent = categories.find((category) => category.slug === parentSlug);
    for (const child of children) {
      const name = normalize(child.name);
      const slug = normalize(child.slug);
      if (name.includes(query) || slug.includes(query) || query.includes(slug)) {
        results.push({
          type: 'category',
          href: `/categories/${parentSlug}?sub=${child.slug}`,
          label: child.name,
          hint: parent?.name ?? 'Category',
        });
      }
    }
  }

  const uniqueCategories: SearchSuggestion[] = [];
  const seenHref = new Set<string>();
  for (const item of results) {
    if (seenHref.has(item.href)) continue;
    seenHref.add(item.href);
    uniqueCategories.push(item);
    if (uniqueCategories.length >= 3) break;
  }

  const matchedProducts = products
    .filter((product) => {
      const name = normalize(product.name);
      const tags = product.tags.join(' ');
      return name.includes(query) || tags.includes(query);
    })
    .slice(0, Math.max(0, limit - uniqueCategories.length))
    .map((product) => ({
      type: 'product' as const,
      href: `/products/${product.slug}`,
      label: product.name,
      hint: 'Product',
      image: product.images[0] ?? '',
    }));

  return [...uniqueCategories, ...matchedProducts];
}

export function resolveSearchDestination(rawQuery: string): string {
  const query = normalize(rawQuery);
  if (!query) return '/products';

  const exactCategory = categories.find((category) => {
    const name = normalize(category.name);
    const slug = normalize(category.slug.replace(/-/g, ' '));
    const aliases = CATEGORY_ALIASES[category.slug] ?? [];
    return name === query || slug === query || aliases.includes(query);
  });
  if (exactCategory) return `/categories/${exactCategory.slug}`;

  const fuzzyCategory = categories.find((category) => {
    const name = normalize(category.name);
    const slug = normalize(category.slug.replace(/-/g, ' '));
    return name.includes(query) || query.includes(name) || slug.includes(query);
  });
  if (fuzzyCategory && query.length >= 4) return `/categories/${fuzzyCategory.slug}`;

  for (const [parentSlug, children] of Object.entries(categoryChildren)) {
    const child = children.find((item) => {
      const name = normalize(item.name);
      const slug = normalize(item.slug);
      return name === query || slug === query || slug === `${query}s` || name.includes(query);
    });
    if (child && (normalize(child.name) === query || normalize(child.slug) === query || query.length >= 5)) {
      return `/categories/${parentSlug}?sub=${child.slug}`;
    }
  }

  const exactProduct = products.find((product) => normalize(product.name) === query);
  if (exactProduct) return `/products/${exactProduct.slug}`;

  const named = products.filter((product) => normalize(product.name).includes(query));
  if (named.length === 1) return `/products/${named[0]!.slug}`;

  const startsWith = products.filter((product) => normalize(product.name).startsWith(query));
  if (startsWith.length === 1) return `/products/${startsWith[0]!.slug}`;

  return `/products?q=${encodeURIComponent(rawQuery.trim())}`;
}
