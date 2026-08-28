import {
  Armchair,
  Laptop,
  Package,
  Paperclip,
  Plug,
  ShoppingBasket,
  SprayCan,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Armchair,
  ShoppingBasket,
  Paperclip,
  Laptop,
  SprayCan,
  Plug,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon className={className} />;
}
