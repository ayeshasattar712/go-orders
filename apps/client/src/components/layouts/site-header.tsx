'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  ChevronDown,
  Heart,
  LayoutGrid,
  Menu,
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { categories, getProductsByCategory } from '@/lib/mock-data';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { clientEnv } from '@/lib/env';
import { CartNavButton } from '@/components/layouts/cart-nav-button';
import { HeaderSearch } from '@/components/layouts/header-search';

const topLinks = [
  { href: '/products', label: 'Shop', icon: ShoppingBag },
  { href: '/categories', label: 'Categories', mega: true, icon: LayoutGrid },
];

const navItemClass = (active: boolean) =>
  cn(
    'group relative flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200',
    active
      ? 'bg-white text-primary shadow-[0_10px_28px_rgba(0,0,0,0.22)] ring-1 ring-white/40'
      : 'text-white/95 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:ring-1 hover:ring-white/25',
  );

export function SiteHeader() {
  const pathname = usePathname();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug ?? '');
  const activeCategoryData = categories.find((category) => category.slug === activeCategory);
  const activeCategoryProducts = activeCategory ? getProductsByCategory(activeCategory, 4) : [];
  const user = useCustomerAuthStore((state) => state.user);
  const logout = useLogout();

  function isTopLinkActive(href: string, mega?: boolean) {
    if (mega) return categoryOpen || pathname.startsWith('/categories');
    if (href === '/products') return pathname === '/products';
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary pt-[env(safe-area-inset-top)] text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-white hover:bg-white/15 hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(20rem,88vw)] flex-col overflow-y-auto text-foreground">
            <SheetHeader>
              <SheetTitle>GoOrder</SheetTitle>
            </SheetHeader>
            <HeaderSearch className="mt-4" onNavigated={() => setMobileOpen(false)} />
            <nav className="mt-4 space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                >
                  <CategoryIcon name={category.icon} className="text-primary h-4 w-4" />
                  {category.name}
                </Link>
              ))}
              <div className="bg-border my-2 h-px" />
              {topLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <Icon className="text-primary h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm sm:hidden"
              >
                <Heart className="h-4 w-4" /> Wishlist
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="font-display hidden text-xl font-semibold tracking-tight sm:inline">
            {clientEnv.NEXT_PUBLIC_APP_NAME}
          </span>
        </Link>

        <HeaderSearch className="min-w-0 flex-1" />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden text-white hover:bg-white/15 hover:text-white sm:inline-flex"
          >
            <Link href="/favorites" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <CartNavButton />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/15 hover:text-white"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user.firstName} />
                    <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user.firstName} {user.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <FileText className="h-4 w-4" /> My orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/invoices">
                    <FileText className="h-4 w-4" /> Invoices
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chat">
                    <Settings className="h-4 w-4" /> Chat with GoOrder
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="h-4 w-4" /> Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="ml-1 bg-white px-2.5 text-primary hover:bg-white/90 sm:px-3"
            >
              <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                <User className="h-4 w-4" />
                <span className="hidden min-[360px]:inline">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
      <nav className="relative hidden border-t border-white/20 bg-gradient-to-r from-[#5b21b6] via-primary to-[#a21caf] lg:block">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-2.5">
          {topLinks.map((link) => {
            const Icon = link.icon;
            const active = isTopLinkActive(link.href, link.mega);
            const itemClass = navItemClass(active);

            const content = (
              <>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
                    active
                      ? 'bg-primary/12 text-primary shadow-inner'
                      : 'bg-white/18 text-white ring-1 ring-white/25 group-hover:bg-white/25',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="leading-none">{link.label}</span>
              </>
            );

            if (link.mega) {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setCategoryOpen(true)}
                  onMouseLeave={() => setCategoryOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setCategoryOpen((v) => !v)}
                    className={itemClass}
                    aria-expanded={categoryOpen}
                    aria-haspopup="true"
                  >
                    {content}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 opacity-80 transition-transform duration-200',
                        categoryOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {categoryOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="bg-popover text-foreground absolute top-full left-1/2 z-50 mt-2.5 flex w-[min(720px,90vw)] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl shadow-black/20"
                      >
                        <div className="w-64 shrink-0 border-r bg-zinc-50/80 p-2">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/categories/${category.slug}`}
                              onMouseEnter={() => setActiveCategory(category.slug)}
                              onClick={() => setCategoryOpen(false)}
                              className={cn(
                                'hover:bg-white flex items-center gap-3 rounded-xl p-3 transition-colors',
                                activeCategory === category.slug &&
                                  'bg-white shadow-sm ring-1 ring-primary/10',
                              )}
                            >
                              <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                <CategoryIcon name={category.icon} className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{category.name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {category.productCount.toLocaleString()} products
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              Popular in {activeCategoryData?.name ?? 'this category'}
                            </p>
                            <Link
                              href={`/categories/${activeCategory}`}
                              onClick={() => setCategoryOpen(false)}
                              className="text-primary text-xs font-medium hover:underline"
                            >
                              View all
                            </Link>
                          </div>
                          {activeCategoryProducts.length > 0 ? (
                            <div className="grid flex-1 grid-cols-2 gap-3">
                              {activeCategoryProducts.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.slug}`}
                                  onClick={() => setCategoryOpen(false)}
                                  className="hover:bg-muted flex items-center gap-3 rounded-xl p-2 transition-colors"
                                >
                                  <span className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                                    <Image
                                      src={product.images[0] ?? ''}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">{product.name}</p>
                                    <p className="text-primary text-xs font-semibold">
                                      {formatCurrency(product.price)}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              No products in this category yet.
                            </p>
                          )}
                          <Link
                            href={`/categories/${activeCategory}`}
                            onClick={() => setCategoryOpen(false)}
                            className="bg-primary text-primary-foreground mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold"
                          >
                            Shop {activeCategoryData?.name ?? 'category'}
                          </Link>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={itemClass}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
