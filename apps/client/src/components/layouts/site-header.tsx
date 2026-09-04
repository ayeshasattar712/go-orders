'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useCartSummary } from '@/store/cart-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { clientEnv } from '@/lib/env';

const topLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Categories', mega: true },
  { href: '/deals', label: 'Deals' },
  { href: '/products?sort=new', label: 'New Arrival' },
  { href: '/vendors', label: 'Brands' },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug ?? '');
  const activeCategoryData = categories.find((category) => category.slug === activeCategory);
  const activeCategoryProducts = activeCategory ? getProductsByCategory(activeCategory, 4) : [];
  const user = useCustomerAuthStore((state) => state.user);
  const { itemCount } = useCartSummary();
  const logout = useLogout();

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 border-2 px-3 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(20rem,88vw)] flex-col overflow-y-auto">
            <SheetHeader>
              <SheetTitle>GoOrder</SheetTitle>
            </SheetHeader>
            <form
              onSubmit={(event) => {
                handleSearch(event);
                setMobileOpen(false);
              }}
              className="mt-4"
            >
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  className="bg-muted/70 h-10 rounded-full pr-3 pl-9 shadow-none"
                />
              </div>
            </form>
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
              {topLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-muted block rounded-lg px-3 py-2.5 text-sm"
                >
                  {link.label}
                </Link>
              ))}
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

        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
          <span className="bg-hero-gradient shadow-primary/30 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="font-display hidden text-xl font-semibold tracking-tight min-[380px]:inline">
            {clientEnv.NEXT_PUBLIC_APP_NAME}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {topLinks.map((link) =>
            link.mega ? (
              <div key={link.href} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setCategoryOpen(false), 150)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium',
                    categoryOpen || pathname.startsWith('/categories')
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-primary',
                  )}
                >
                  {link.label}
                  <ChevronDown className={cn('h-3.5 w-3.5', categoryOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {categoryOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="bg-popover absolute top-full left-1/2 z-50 mt-2 flex w-[720px] -translate-x-1/2 overflow-hidden rounded-xl border shadow-xl"
                    >
                      <div className="w-64 shrink-0 border-r p-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            onMouseEnter={() => setActiveCategory(category.slug)}
                            className={cn(
                              'hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors',
                              activeCategory === category.slug && 'bg-muted',
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
                            className="text-primary text-xs font-medium hover:underline"
                          >
                            View all
                          </Link>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-3">
                          {activeCategoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              className="hover:bg-muted flex items-center gap-3 rounded-lg p-2 transition-colors"
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
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-3 py-2 text-sm font-medium',
                  pathname === link.href ? 'text-primary' : 'text-foreground/70 hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <form onSubmit={handleSearch} className="hidden w-56 items-center xl:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="bg-muted/70 h-10 rounded-full pr-3 pl-9 shadow-none"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/favorites" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 ? (
                <Badge
                  variant="brand"
                  className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full p-0 px-1 text-[10px]"
                >
                  {itemCount}
                </Badge>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
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
            <Button asChild variant="default" size="sm" className="ml-1 px-2.5 sm:px-3">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                <User className="h-4 w-4" />
                <span className="hidden min-[360px]:inline">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
      <form onSubmit={handleSearch} className="border-t px-3 py-2 xl:hidden">
        <div className="relative mx-auto max-w-7xl">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="bg-muted/70 h-10 rounded-full pr-3 pl-9 shadow-none"
          />
        </div>
      </form>
    </header>
  );
}
