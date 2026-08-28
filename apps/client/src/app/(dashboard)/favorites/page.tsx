import type { Metadata } from 'next';
import { FavoritesGrid } from '@/features/dashboard/components/favorites-grid';

export const metadata: Metadata = {
  title: 'Favorites',
};

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Favorites</h2>
        <p className="text-muted-foreground">
          Products and vendors you&apos;ve saved for quick reordering.
        </p>
      </div>
      <FavoritesGrid />
    </div>
  );
}
