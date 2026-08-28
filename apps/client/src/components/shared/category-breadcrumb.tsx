'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { categories, getCategoryChildren } from '@/lib/mock-data';
import { CategoryIcon } from '@/components/shared/category-icon';
import { cn } from '@/lib/utils';

export function CategoryBreadcrumb({ currentName }: { currentName: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const activeCategories = categories.filter((category) => category.status === 'active');

  function openMenu() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <nav className="text-muted-foreground mx-auto flex max-w-7xl items-center gap-1.5 px-4 pt-6 text-sm sm:px-6">
      <Link href="/home" className="hover:text-foreground">
        Home
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <div
        className="relative"
        onMouseEnter={openMenu}
        onPointerEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <Link
          href="/categories"
          className={cn('hover:text-primary', open && 'text-primary')}
          onFocus={openMenu}
        >
          Categories
        </Link>
        {open ? (
          <div
            className="bg-card absolute top-full left-0 z-50 mt-2 w-[320px] rounded-xl border p-2 shadow-xl"
            onMouseEnter={openMenu}
            onPointerEnter={openMenu}
          >
            {activeCategories.map((category) => (
              <div key={category.id} className="rounded-lg px-2 py-1.5">
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-primary text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  <CategoryIcon name={category.icon} className="text-primary h-4 w-4 shrink-0" />
                  {category.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 pl-6">
                  {getCategoryChildren(category.slug)
                    .slice(0, 4)
                    .map((child) => (
                      <Link
                        key={child.slug}
                        href={`/products?category=${category.slug}&q=${encodeURIComponent(child.name)}`}
                        className="text-muted-foreground hover:text-primary text-xs"
                      >
                        {child.name}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="text-foreground truncate">{currentName}</span>
    </nav>
  );
}
