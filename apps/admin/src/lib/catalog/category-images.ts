export interface CatalogImageOption {
  label: string;
  url: string;
}

const FURNITURE: CatalogImageOption[] = [
  {
    label: 'Office chairs',
    url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Desk setup',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Meeting room',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
  },
];

const GROCERY: CatalogImageOption[] = [
  {
    label: 'Produce aisle',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Pantry goods',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Fresh market',
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop',
  },
];

const OFFICE: CatalogImageOption[] = [
  {
    label: 'Stationery',
    url: 'https://images.unsplash.com/photo-1583225214464-9296029427aa?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Notebooks',
    url: 'https://images.unsplash.com/photo-1456327102063-fb5054efe647?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Desk supplies',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop',
  },
];

const IT: CatalogImageOption[] = [
  {
    label: 'Laptop',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Hardware',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Monitor',
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop',
  },
];

const CLEANING: CatalogImageOption[] = [
  {
    label: 'Janitorial',
    url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Supplies',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Bottles',
    url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop',
  },
];

const ELECTRICAL: CatalogImageOption[] = [
  {
    label: 'Wiring',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Lighting',
    url: 'https://images.unsplash.com/photo-1507473882602-a56c78b5b0b0?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Tools',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop',
  },
];

export function imagesForCategory(nameOrSlug: string): CatalogImageOption[] {
  const key = nameOrSlug.toLowerCase();
  if (key.includes('furn') || key.includes('chair') || key.includes('desk')) return FURNITURE;
  if (key.includes('groc') || key.includes('pantry') || key.includes('food')) return GROCERY;
  if (key.includes('office') || key.includes('suppl') || key.includes('station')) return OFFICE;
  if (key.includes('it') || key.includes('tech') || key.includes('laptop') || key.includes('equip'))
    return IT;
  if (key.includes('clean') || key.includes('janitor')) return CLEANING;
  if (key.includes('electr') || key.includes('wire') || key.includes('light')) return ELECTRICAL;
  return [...FURNITURE, ...IT, ...GROCERY].slice(0, 6);
}
