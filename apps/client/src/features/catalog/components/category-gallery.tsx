'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function CategoryGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const gallery = images.filter(Boolean);
  const current = gallery[active] ?? gallery[0];

  if (!current) return null;

  return (
    <div className="flex max-w-xl flex-col gap-2">
      <div className="relative aspect-[16/9] w-full max-h-52 overflow-hidden rounded-xl border bg-white sm:max-h-64">
        <Image
          src={current}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 640px) 36rem, 90vw"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              'relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition-colors sm:h-14 sm:w-20',
              active === index ? 'border-foreground' : 'border-border hover:border-foreground/40',
            )}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="72px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
