import { DashboardShell } from '@/components/layouts/dashboard-shell';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
