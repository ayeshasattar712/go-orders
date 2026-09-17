'use client';

import { useEffect } from 'react';
import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { colorPalettes, applyPalette } from '@/lib/palettes';
import { usePaletteStore } from '@/store/palette-store';

/** Ensures the persisted palette is applied even if the store rehydrates before this mounts. */
function usePaletteSync() {
  const paletteId = usePaletteStore((state) => state.paletteId);
  useEffect(() => {
    applyPalette(paletteId);
  }, [paletteId]);
}

export function PaletteSwitcher({ triggerClassName }: { triggerClassName?: string }) {
  usePaletteSync();
  const paletteId = usePaletteStore((state) => state.paletteId);
  const setPalette = usePaletteStore((state) => state.setPalette);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={cn('gap-2', triggerClassName)}>
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-72 overflow-y-auto">
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {colorPalettes.map((palette) => (
          <DropdownMenuItem
            key={palette.id}
            onClick={() => setPalette(palette.id)}
            className="flex items-center gap-2.5"
          >
            <span className="flex shrink-0 -space-x-1.5">
              {palette.swatch.map((hex, index) => (
                <span
                  key={index}
                  className="h-4 w-4 rounded-full border border-white/60 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{palette.name}</span>
            {paletteId === palette.id ? (
              <Check className="text-primary h-4 w-4 shrink-0" />
            ) : (
              <span className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
