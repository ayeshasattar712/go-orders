import { SiteHeader } from '@/components/layouts/site-header';
import { SiteFooter } from '@/components/layouts/site-footer';
import { CustomerAuthProvider } from '@/providers/customer-auth-provider';
import { AuthPromptModal } from '@/components/auth/auth-prompt-modal';

export default function ShopGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <div className="dark:bg-background flex min-h-screen flex-col bg-[#f8f9fa]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <AuthPromptModal />
    </CustomerAuthProvider>
  );
}
