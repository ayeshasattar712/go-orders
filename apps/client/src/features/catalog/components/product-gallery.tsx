'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-white">
        <Image
          src={images[active] ?? images[0] ?? ''}
          alt={name}
          fill
          priority
          className="object-contain p-8 sm:p-12"
          sizes="(min-width: 1024px) 50vw, 90vw"
        />
      </div>
      {images.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors',
                active === index
                  ? 'border-foreground'
                  : 'border-border hover:border-foreground/40',
              )}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-contain p-2"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
