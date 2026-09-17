'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSearchSuggestions, resolveSearchDestination } from '@/lib/catalog/search-resolve';

export function HeaderSearch({
  className,
  onNavigated,
}: {
  className?: string;
  onNavigated?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeIndexQuery, setActiveIndexQuery] = useState(query);
  if (query !== activeIndexQuery) {
    setActiveIndexQuery(query);
    setActiveIndex(0);
  }
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getSearchSuggestions(query), [query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    onNavigated?.();
    router.push(href);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const selected = suggestions[activeIndex];
    go(selected?.href ?? resolveSearchDestination(query));
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex h-11 overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/10">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (!open || suggestions.length === 0) return;
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((index) => (index + 1) % suggestions.length);
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
              }
              if (event.key === 'Escape') setOpen(false);
            }}
            placeholder="Search furniture, electronics, or a product"
            className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-0 bg-transparent px-3 text-base outline-none md:text-sm"
            aria-label="Search products and categories"
            aria-autocomplete="list"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-11 w-11 shrink-0 items-center justify-center"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 ? (
        <div className="text-foreground absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border bg-white shadow-xl">
          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((item, index) => (
              <li key={`${item.type}-${item.href}`}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm',
                    index === activeIndex ? 'bg-primary/10' : 'hover:bg-muted',
                  )}
                >
                  {item.type === 'product' ? (
                    <span className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                      {item.image ? (
                        <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />
                      ) : null}
                    </span>
                  ) : (
                    <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-wide">
                      CAT
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    <span className="text-muted-foreground text-xs">{item.hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
