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
  { href: '/deals', label: 'Flash Sale' },
  { href: '/products', label: 'All products' },
  { href: '/categories', label: 'Categories' },
  { href: '/vendors', label: 'Mall' },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
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
    <header className="bg-background/85 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="bg-primary/95 text-primary-foreground border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs sm:px-6">
          <p className="hidden sm:block">
            Free delivery over $500 · Pay by bank or JazzCash/Raast · Track every parcel
          </p>
          <div className="flex items-center gap-4">
            <Link href="/vendors/apply" className="hover:underline">
              Become a vendor
            </Link>
            <Link href="/support" className="hover:underline">
              Support
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>GoOrder</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
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
                  className="hover:bg-muted block rounded-lg px-3 py-2.5 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
        </Link>

        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setCategoryOpen((v) => !v)}
            onBlur={() => setTimeout(() => setCategoryOpen(false), 150)}
            className="hover:bg-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
          >
            <Menu className="h-4 w-4" />
            Categories
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', categoryOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence>
            {categoryOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="bg-popover absolute top-full left-0 z-50 mt-2 flex w-[720px] overflow-hidden rounded-xl border shadow-xl"
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
                    {activeCategoryProducts.length === 0 ? (
                      <p className="text-muted-foreground col-span-2 text-sm">
                        No products available yet.
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, SKUs, or vendors..."
              className="h-10 pl-10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
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
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/?next=${encodeURIComponent(pathname)}`}>Sign up</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="ml-1">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                  <User className="h-4 w-4" /> Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="hidden border-t lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 text-sm">
          {topLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-muted-foreground hover:text-foreground font-medium transition-colors',
                pathname === link.href && 'text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
