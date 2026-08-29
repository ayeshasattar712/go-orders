'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-white sm:flex-1">
        <Image
          src={images[active] ?? images[0] ?? ''}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 40vw, 90vw"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto sm:w-20 sm:flex-col">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              'bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
              active === index ? 'border-primary' : 'hover:border-border border-transparent',
            )}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
